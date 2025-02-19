import path from "path";
import * as fs from "fs";
import { contentDir } from "@/constants";
import { FastifyReply, FastifyRequest } from "fastify";

export default async function checkPathIsExist<ParamsType>(
  request: FastifyRequest<{
    Querystring: { lang: LangType };
    Params: ParamsType;
  }>,
  reply: FastifyReply
) {
  const lang: LangType = request.query.lang || "en";
  request.lang = lang;

  let url: string = request.url.slice(1);
  url = url.substring(url.indexOf("/"));

  let rootUrl =
    request.params && Object.keys(request.params).length > 0
      ? url.substring(0, url.lastIndexOf("/"))
      : url;

  rootUrl = rootUrl.split("?")[0];

  const fileName =
    request.params && Object.keys(request.params).length > 0
      ? url.substring(url.lastIndexOf("/") + 1).split("?")[0]
      : "";

  const fullDir = path.join(contentDir, lang, rootUrl);
  // If the path is not exits, 2 cases should be considered:
  // 1) the path is a file
  // 2) the path truely does not exist

  if (!fs.existsSync(path.join(fullDir, fileName))) {
    const p = path.format({
      dir: fullDir,
      name: fileName,
      ext: ".md",
    });

    if (!fs.existsSync(p)) {
      reply.code(404).send({ message: "Page Not Found" });
      return;
    } else {
      request.path = {
        fullPath: p,
        isDir: false,
      };
    }
  } else {
    request.path = {
      fullPath: path.join(fullDir, fileName),
      isDir: true,
    };
  }
}
