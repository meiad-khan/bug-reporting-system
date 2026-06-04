import dotenv from "dotenv";
import { env } from "process";

dotenv.config();

export const config = {
  port: env.PORT,
  database_url: env.DATABASE_URL as string,
};
