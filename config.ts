import fs from "fs";
import path from "path";
import z from "zod";
import { config } from "dotenv";

config({
  path: ".env",
});

// Check env
(async () => {
  if (!fs.existsSync(path.resolve(".env"))) {
    console.log(".env not found");
    process.exit(1);
  }
})();

const configSchema = z.object({
  PORT: z.coerce.number().default(4000),
  SESSION_TOKEN_SECRET: z.string(),
  SESSION_TOKEN_EXPIRES_IN: z.string(),
  DOMAIN: z.string(),
  PROTOCOL: z.string(),
  MEDIA_UPLOAD_FOLDER: z.string(),
  IS_PRODUCTION: z.enum(["true", "false"]).transform((val) => val === "true"),
  PRODUCTION_URL: z.string(),
  USERS_DB: z
    .string()
    .transform((p) =>
      p.startsWith("/")
        ? path.normalize(__dirname + p)
        : path.normalize(__dirname + "/" + p)
    ),
  SESSION_DB: z
    .string()
    .transform((p) =>
      p.startsWith("/")
        ? path.normalize(__dirname + p)
        : path.normalize(__dirname + "/" + p)
    ),
  CONTENTS_UPLOAD_FOLDER: z
    .string()
    .transform((dir) =>
      dir.startsWith("/")
        ? path.normalize(__dirname + dir)
        : path.normalize(__dirname + "/" + dir)
    ),
});

const configServer = configSchema.safeParse(process.env);

if (!configServer.success) {
  console.error(configServer.error.issues);
  throw new Error("Các giá trị khai báo trong file .env không hợp lệ");
}
const envConfig = configServer.data;
export const API_URL = envConfig.IS_PRODUCTION
  ? envConfig.PRODUCTION_URL
  : `${envConfig.PROTOCOL}://${envConfig.DOMAIN}:${envConfig.PORT}`;
  
export default envConfig;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends z.infer<typeof configSchema> {}
  }
}
