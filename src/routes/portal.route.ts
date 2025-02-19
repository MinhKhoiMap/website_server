import path from "path";
import * as fs from "fs";

import { categoryCase, contentDir } from "@/constants";
import {
  receiveNewPortalPostController,
  updatePortalPostController,
} from "@/controllers/portal.controller";
import {
  CreatePortalPostBody,
  CreatePortalPostBodyType,
  UpdatePortalPostBody,
  UpdatePortalPostBodyType,
} from "@/schemaValidation/post.schema";
import { ErrorResType } from "@/types/error.types";
import { PostParamsRequestType } from "@/types/post.types";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

async function processPath<ParamsType>(
  request: FastifyRequest<{
    Querystring: { lang: LangType };
    Params: ParamsType;
    Body: CreatePortalPostBodyType | UpdatePortalPostBodyType;
  }>,
  reply: FastifyReply
) {
  const lang: LangType = request.query.lang || "en";
  request.lang = lang;

  const { category, id } = request.body;

  let repository: string = "";

  switch (category) {
    case categoryCase.news:
      repository = "news";
      break;
    case categoryCase.evolvingResearch:
      repository = "evolving_research";
      break;
    case categoryCase.voiceFromPublic:
      repository = "voice_from_public";
      break;
    case categoryCase.openAdmission:
      repository = "open_admission";
      break;
    default:
      reply.code(400).send({
        message: "Unknown category!",
      });
  }

  const dir = path.join(contentDir, lang, repository);

  const p = path.format({
    dir,
    name: id,
    ext: ".md",
  });

  if (!fs.existsSync(p) && request.url.includes("update")) {
    reply.code(404).send({ message: "File Not Found" });
  } else if (fs.existsSync(p) && request.url.includes("create")) {
    reply.code(406).send({ message: "File Already Exists" });
  }

  request.path = {
    fullPath: p,
    isDir: false,
  };
}

async function portalRoute(server: FastifyInstance) {
  server.post<{
    Reply: { 200: { message: string }; 500: ErrorResType };
    Querystring: { lang: LangType };
    Body: CreatePortalPostBodyType;
    Params: PostParamsRequestType;
  }>(
    "/create",
    {
      preHandler: [processPath],
      schema: {
        body: CreatePortalPostBody,
      },
    },
    receiveNewPortalPostController
  );

  server.post<{
    Reply: { 200: { message: string }; 500: ErrorResType };
    Querystring: { lang: LangType };
    Params: PostParamsRequestType;
    Body: UpdatePortalPostBodyType;
  }>(
    "/update",
    {
      preHandler: [processPath],
      schema: {
        body: UpdatePortalPostBody,
      },
    },
    updatePortalPostController
  );
}

export default portalRoute;
