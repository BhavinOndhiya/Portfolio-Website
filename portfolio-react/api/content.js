const dbConnect = require("./_lib/db");
const Content = require("./_lib/contentModel");
const { applyAction } = require("./_lib/contentActions");
const parseBody = require("./_lib/getBody");
const { verifyToken } = require("./_lib/auth");
const initialContent = require("../src/data/initialContent.json");

async function getOrCreateContent() {
  let doc = await Content.findOne({ slug: "default" });
  if (!doc) {
    doc = await Content.create({ slug: "default", data: initialContent });
  }
  return doc;
}

module.exports = async (req, res) => {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const doc = await getOrCreateContent();
      res.status(200).json(doc.data);
    } catch (error) {
      console.error("[content][GET]", error);
      res.status(500).json({ error: "Failed to load content" });
    }
    return;
  }

  const user = verifyToken(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const body = await parseBody(req);
    const doc = await getOrCreateContent();

    if (req.method === "POST") {
      doc.data = body.content || doc.data;
      await doc.save();
      res.status(200).json(doc.data);
      return;
    }

    if (req.method === "PATCH") {
      doc.data = applyAction(doc.data, body);
      await doc.save();
      res.status(200).json(doc.data);
      return;
    }

    res.setHeader("Allow", "GET,POST,PATCH");
    res.status(405).end("Method Not Allowed");
  } catch (error) {
    console.error("[content]", error);
    res.status(500).json({ error: "Failed to update content" });
  }
};
