const { verifyToken } = require("../_lib/auth");
const parseBody = require("../_lib/getBody");
const { reprocessPortfolioImages } = require("../_lib/reprocessPortfolio");

const ALLOWED_METHODS = ["GET", "POST", "OPTIONS"];

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  if (typeof value === "boolean") {
    return value;
  }
  const normalized = String(value).toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "n", "off"].includes(normalized)) {
    return false;
  }
  return fallback;
};

module.exports = async (req, res) => {
  if (!ALLOWED_METHODS.includes(req.method)) {
    res.setHeader("Allow", ALLOWED_METHODS.join(","));
    res.status(405).end("Method Not Allowed");
    return;
  }

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const tokenParam = url.searchParams.get("token");
  if (!req.headers.authorization && tokenParam) {
    req.headers.authorization = `Bearer ${tokenParam}`;
  }

  const user = verifyToken(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const defaultDryRun = req.method === "GET";
  let dryRun = parseBoolean(url.searchParams.get("dryRun"), defaultDryRun);
  let force = parseBoolean(url.searchParams.get("force"), false);

  if (req.method === "POST") {
    try {
      const body = await parseBody(req);
      if (body.hasOwnProperty("dryRun")) {
        dryRun = parseBoolean(body.dryRun, dryRun);
      }
      if (body.hasOwnProperty("force")) {
        force = parseBoolean(body.force, force);
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid JSON body" });
      return;
    }
  }

  try {
    const summary = await reprocessPortfolioImages({
      dryRun,
      force,
      logger: console,
    });
    res.status(200).json(summary);
  } catch (error) {
    console.error("[admin/reprocessPortfolio]", error);
    res.status(500).json({ error: error.message });
  }
};
