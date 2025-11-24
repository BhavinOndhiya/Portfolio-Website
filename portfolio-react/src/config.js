const rawBase = process.env.REACT_APP_API_BASE_URL || "";
const normalizedBase =
  rawBase.endsWith("/") && rawBase.length > 1 ? rawBase.slice(0, -1) : rawBase;

export const API_BASE_URL = normalizedBase;
export const ADMIN_API_BASE_URL = normalizedBase;

const config = {
  API_BASE_URL,
  ADMIN_API_BASE_URL,
};

export default config;
