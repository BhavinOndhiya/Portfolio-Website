const path = require("path");
const dotenv = require("dotenv");
const sharp = require("sharp");
const fetch = require("node-fetch");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const dbConnect = require("../api/_lib/db");
const Content = require("../api/_lib/contentModel");
const initialContent = require("../src/data/initialContent.json");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const REQUIRED_ENV_VARS = [
  "MONGODB_URI",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "AWS_S3_BUCKET",
];

const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(
    `[reprocess] Missing required environment variables: ${missing.join(", ")}`
  );
  process.exit(1);
}

const TARGET_WIDTH = Number(process.env.PORTFOLIO_WIDTH || 1200);
const TARGET_HEIGHT = Number(process.env.PORTFOLIO_HEIGHT || 900);
const JPEG_QUALITY = Number(process.env.PORTFOLIO_QUALITY || 90);
const uploadPrefix = (process.env.AWS_UPLOAD_PREFIX || "uploads").replace(
  /\/$/,
  ""
);
const publicBaseUrl =
  process.env.AWS_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
  `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`;

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const force = args.has("--force");

const s3 = new S3Client({
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

async function getOrCreateContentDoc() {
  let doc = await Content.findOne({ slug: "default" });
  if (!doc) {
    doc = await Content.create({ slug: "default", data: initialContent });
  }
  return doc;
}

async function downloadImageBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url} (${response.status})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadProcessedBuffer(buffer, project) {
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
}

async function processProjectImage(project) {
  if (!project.imageUrl) {
    return { skipped: true, reason: "missing imageUrl" };
  }

  if (!force && project.imageMeta?.standardized) {
    return { skipped: true, reason: "already standardized" };
  }

  const originalUrl = project.imageUrl;
  const sourceBuffer = await downloadImageBuffer(originalUrl);
  const processedBuffer = await sharp(sourceBuffer)
    .resize(TARGET_WIDTH, TARGET_HEIGHT, {
      fit: "cover",
      position: "centre",
    })
    .jpeg({
      quality: JPEG_QUALITY,
      chromaSubsampling: "4:4:4",
    })
    .toBuffer();

  const uploadedUrl = await uploadProcessedBuffer(processedBuffer, project);

  if (!dryRun) {
    project.imageMeta = {
      standardized: true,
      width: TARGET_WIDTH,
      height: TARGET_HEIGHT,
      quality: JPEG_QUALITY,
      processedAt: new Date().toISOString(),
      originalUrl: project.imageMeta?.originalUrl || originalUrl,
    };
    project.previousImageUrl = originalUrl;
    project.imageUrl = uploadedUrl;
  }

  return { updated: true, originalUrl, uploadedUrl };
}

async function main() {
  await dbConnect();
  const doc = await getOrCreateContentDoc();
  const portfolio = doc?.data?.portfolio || [];

  if (!portfolio.length) {
    console.warn("[reprocess] No portfolio entries found.");
    process.exit(0);
  }

  const summary = {
    total: portfolio.length,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  for (const project of portfolio) {
    try {
      const result = await processProjectImage(project);
      if (result.updated) {
        summary.updated += 1;
        console.log(
          `[reprocess] ${project.title || project.category} -> ${
            result.uploadedUrl
          }`
        );
      } else if (result.skipped) {
        summary.skipped += 1;
        console.log(
          `[reprocess] Skipped ${project.title || project.category}: ${
            result.reason
          }`
        );
      }
    } catch (error) {
      summary.errors += 1;
      console.error(
        `[reprocess] Failed ${project.title || project.category}: ${
          error.message
        }`
      );
    }
  }

  if (!dryRun) {
    await doc.save();
  } else {
    console.log(
      "[reprocess] Dry run enabled; no database changes were persisted."
    );
  }

  console.log(
    `[reprocess] Completed. Updated=${summary.updated}, Skipped=${summary.skipped}, Errors=${summary.errors}`
  );

  process.exit(summary.errors ? 1 : 0);
}

main().catch((error) => {
  console.error("[reprocess] Unhandled error", error);
  process.exit(1);
});
