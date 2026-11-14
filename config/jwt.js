import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

// In production, strictly enforce JWT_SECRET configuration
if (isProduction && !process.env.JWT_SECRET) {
  throw new Error(
    "FATAL CONFIG ERROR: JWT_SECRET environment variable must be defined in production!"
  );
}

// In development, allow fallback with a clear warning
if (!process.env.JWT_SECRET) {
  console.warn(
    "⚠️ WARNING: JWT_SECRET environment variable is missing. Using development fallback secret. Set JWT_SECRET in production!"
  );
}

export const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
export const JWT_ALGORITHM = "HS256";

export default JWT_SECRET;
