const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const path = require("path");
const parseBody = require("../_lib/getBody");
const { verifyToken } = require("../_lib/auth");

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION;
const bucket = process.env.AWS_S3_BUCKET;
const publicBaseUrl = process.env.AWS_PUBLIC_BASE_URL;
const uploadPrefix = process.env.AWS_UPLOAD_PREFIX || "uploads";
const corsOrigin = process.env.CORS_ORIGIN;

if (!accessKeyId || !secretAccessKey || !region || !bucket) {
  throw new Error(
    "Missing AWS config. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and AWS_S3_BUCKET."
  );
}

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const setCors = (res) => {
  if (corsOrigin) {
    res.setHeader("Access-Control-Allow-Origin", corsOrigin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

module.exports = async (req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST,OPTIONS");
    res.status(405).end("Method Not Allowed");
    return;
  }

  const user = verifyToken(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const body = await parseBody(req);
    const { filename, contentType } = body || {};

    if (!filename || !contentType) {
      res.status(400).json({ error: "filename and contentType are required" });
      return;
    }

    const ext = path.extname(filename) || "";
    const baseName = path.basename(filename, ext).replace(/[^a-z0-9-_]/gi, "");
    const safeBase = baseName || "file";
    const key = `${uploadPrefix}/${Date.now()}-${safeBase}${ext}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ACL: "public-read",
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    const baseUrl =
      publicBaseUrl?.replace(/\/$/, "") ||
      `https://${bucket}.s3.${region}.amazonaws.com`;

    res.status(200).json({
      uploadUrl,
      fileUrl: `${baseUrl}/${key}`,
      key,
    });
  } catch (error) {
    console.error("[uploads/sign]", error);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
};
