import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number | string;
  database_url?: string;
  google_factcheck_api_key?: string;
  google_factcheck_url: string;
  jwt_secret: string;
  expires_in: string;
}

// Validate JWT configuration at startup
//This is for debugging purpose please
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be defined and at least 32 characters long");
}

if (!process.env.JWT_EXPIRES_IN) {
  console.warn("JWT_EXPIRES_IN not set, defaulting to '30d'");
}

const config: Config = {
  port: process.env.PORT || 3000,
  database_url: process.env.MONGODB_URI,
  google_factcheck_api_key: process.env.API_KEY,
  google_factcheck_url:
    "https://factchecktools.googleapis.com/v1alpha1/claims:search",
  jwt_secret: process.env.JWT_SECRET,
  expires_in: process.env.JWT_EXPIRES_IN || "30d",
};

console.log("JWT Configuration:", {
  secretLength: config.jwt_secret?.length,
  expiresIn: config.expires_in,
});

export default config;
