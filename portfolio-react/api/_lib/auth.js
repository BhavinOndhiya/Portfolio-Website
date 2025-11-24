const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}

function verifyToken(req) {
  const authHeader =
    req.headers.authorization || req.headers.Authorization || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return null;
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });
}

module.exports = {
  verifyToken,
  createToken,
};
