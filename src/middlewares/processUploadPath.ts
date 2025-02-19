import fs from "fs";
import { FastifyReply, FastifyRequest } from "fastify";
import envConfig from "@/../config";

export default async function processUploadPath(
  request: FastifyRequest<{
    Querystring: { lang: LangType };
  }>,
  reply: FastifyReply
) {
  const lang: LangType = request.query.lang || "en";
  request.lang = lang;

  const uploadPath =
    envConfig.MEDIA_UPLOAD_FOLDER + request.url.split("/upload")[1];

  try {
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
  } catch (err) {
    console.error(err);
  }

  request.path = { fullPath: uploadPath, isDir: true };
}
