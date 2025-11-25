const sharp = require("sharp");
const fetch = require("node-fetch");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const dbConnect = require("./db");
const Content = require("./contentModel");
const initialContent = require("../../src/data/initialContent.json");

const REQUIRED_ENV_VARS = [
  "MONGODB_URI",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "AWS_S3_BUCKET",
];

const ensureEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
};

const getS3Client = () =>
  new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || `project-${Date.now()}`;

const getOrCreateContentDoc = async () => {
  let doc = await Content.findOne({ slug: "default" });
  if (!doc) {
    doc = await Content.create({ slug: "default", data: initialContent });
  }
  return doc;
};

const isAbsoluteUrl = (value = "") => /^https?:\/\//i.test(value);

const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return null;
  }
  if (isAbsoluteUrl(imageUrl)) {
    return imageUrl;
  }
  const base =
    process.env.PUBLIC_APP_URL ||
    process.env.PUBLIC_IMAGE_BASE_URL ||
    process.env.PUBLIC_SITE_URL;
  if (!base) {
    throw new Error(
      `Relative image path "${imageUrl}" encountered but PUBLIC_APP_URL (or PUBLIC_IMAGE_BASE_URL / PUBLIC_SITE_URL) is not configured.`
    );
  }
  const normalizedBase = base.replace(/\/$/, "");
  const normalizedPath = imageUrl.replace(/^\//, "");
  return `${normalizedBase}/${normalizedPath}`;
};

const downloadImageBuffer = async (url) => {
  const absoluteUrl = resolveImageUrl(url);
  if (!absoluteUrl) {
    throw new Error("Image URL is missing");
  }
  const response = await fetch(absoluteUrl);
  if (!response.ok) {
    throw new Error(`Failed to download ${absoluteUrl} (${response.status})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const uploadProcessedBuffer = async (
  buffer,
  project,
  { s3, dryRun, publicBaseUrl, uploadPrefix }
) => {
  const name = slugify(project.title || project.category || "portfolio");
  const key = `${uploadPrefix}/portfolio/${Date.now()}-${name}-std.jpg`;

  if (dryRun) {
    return `${publicBaseUrl}/${key}`;
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: "image/jpeg",
    })
  );

  return `${publicBaseUrl}/${key}`;
};

const processProject = async ({
  project,
  options,
  meta,
  s3,
  logger,
  dryRun,
  force,
}) => {
  if (!project.imageUrl) {
    return { status: "skipped", reason: "missing imageUrl" };
  }

  if (!force && project.imageMeta?.standardized) {
    return { status: "skipped", reason: "already standardized" };
  }

  const originalUrl = project.imageUrl;
  const sourceBuffer = await downloadImageBuffer(originalUrl);

  const processedBuffer = await sharp(sourceBuffer)
    .resize(options.width, options.height, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .jpeg({
      quality: options.quality,
      chromaSubsampling: "4:4:4",
    })
    .toBuffer();

  const uploadedUrl = await uploadProcessedBuffer(processedBuffer, project, {
    s3,
    dryRun,
    publicBaseUrl: meta.publicBaseUrl,
    uploadPrefix: meta.uploadPrefix,
  });

  if (!dryRun) {
    project.imageMeta = {
      standardized: true,
      width: options.width,
      height: options.height,
      quality: options.quality,
      processedAt: new Date().toISOString(),
      originalUrl: project.imageMeta?.originalUrl || originalUrl,
    };
    project.previousImageUrl = originalUrl;
    project.imageUrl = uploadedUrl;
  }

  logger?.log?.(
    `[reprocess] ${project.title || project.category} -> ${uploadedUrl}`
  );

  return { status: "updated", uploadedUrl, originalUrl };
};

const reprocessPortfolioImages = async ({
  dryRun = false,
  force = false,
  logger = console,
  width = Number(process.env.PORTFOLIO_WIDTH || 1200),
  height = Number(process.env.PORTFOLIO_HEIGHT || 900),
  quality = Number(process.env.PORTFOLIO_QUALITY || 90),
} = {}) => {
  ensureEnv();
  await dbConnect();
  const s3 = getS3Client();
  const doc = await getOrCreateContentDoc();
  const portfolio = doc?.data?.portfolio || [];

  if (!portfolio.length) {
    return {
      total: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      dryRun,
      details: [],
      message: "No portfolio entries found",
    };
  }

  const uploadPrefix = (process.env.AWS_UPLOAD_PREFIX || "uploads").replace(
    /\/$/,
    ""
  );
  const publicBaseUrl =
    process.env.AWS_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`;

  const summary = {
    total: portfolio.length,
    updated: 0,
    skipped: 0,
    errors: 0,
    dryRun,
    details: [],
  };

  for (const project of portfolio) {
    try {
      const result = await processProject({
        project,
        options: { width, height, quality },
        meta: { uploadPrefix, publicBaseUrl },
        s3,
        logger,
        dryRun,
        force,
      });

      summary.details.push({
        id: project.id,
        title: project.title,
        status: result.status,
        reason: result.reason,
        uploadedUrl: result.uploadedUrl,
      });

      if (result.status === "updated") {
        summary.updated += 1;
      } else if (result.status === "skipped") {
        summary.skipped += 1;
        logger?.log?.(
          `[reprocess] Skipped ${project.title || project.category}: ${
            result.reason
          }`
        );
      }
    } catch (error) {
      summary.errors += 1;
      summary.details.push({
        id: project.id,
        title: project.title,
        status: "error",
        error: error.message,
      });
      logger?.error?.(
        `[reprocess] Failed ${project.title || project.category}: ${
          error.message
        }`
      );
    }
  }

  if (!dryRun) {
    await doc.save();
  }

  return summary;
};

module.exports = {
  reprocessPortfolioImages,
};
