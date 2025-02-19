import fs from "fs";
import { pipeline } from "node:stream/promises";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { requiredLoginedHook } from "@/hooks/auth.hook";
import processUploadPath from "@/middlewares/processUploadPath";

async function uploadImageRoute(server: FastifyInstance) {
  server.post<{
    Querystring: { lang: LangType };
  }>(
    "/:category/:title",
    { preValidation: [requiredLoginedHook], preHandler: [processUploadPath] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const parts = request.files();
        for await (const part of parts) {
          if (part.file) {
            console.log(`${request.path.fullPath}/${part.filename}`);
            await pipeline(
              part.file,
              fs.createWriteStream(`${request.path.fullPath}/${part.filename}`)
            );
          }
        }
        reply.code(200).send({
          message: "files uploaded successfully",
          path: request.path.fullPath,
        });
      } catch (_e) {
        const e: Error = _e as Error;
        console.error(e);
        reply.code(500).send({
          message: e.message,
        });
      }
    }
  );
}

export default uploadImageRoute;
