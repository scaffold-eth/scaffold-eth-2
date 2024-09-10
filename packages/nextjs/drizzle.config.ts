import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ".env.development" });

export default defineConfig({
  schema: "./services/database/config/schema.ts",
  out: "./services/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL as string,
  },
});
