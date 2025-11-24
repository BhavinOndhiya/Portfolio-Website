const parseBody = require("../_lib/getBody");
const { createToken } = require("../_lib/auth");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error(
    "Missing ADMIN_EMAIL or ADMIN_PASSWORD environment variables"
  );
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
    return;
  }

  try {
    const body = await parseBody(req);
    const { email, password } = body;

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = createToken({ email });
    res.status(200).json({ token });
  } catch (error) {
    console.error("[admin/login]", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};
