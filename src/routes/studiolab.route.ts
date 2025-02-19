import { FastifyInstance } from "fastify";
import checkPathIsExist from "@/middlewares/checkPathIsExist";
import {
  getCollaborationList,
  getCollaborationProject,
} from "@/controllers/studiolab.controller";
import { ErrorResType } from "@/types/error.types";
import {
  CollaborationStudioListResType,
  CollaborationStudioProjectResType,
} from "@/types/studiolab.type";
import { PostParamsRequestType } from "@/types/post.types";

async function studiolabRoute(server: FastifyInstance) {
  server.get<{
    Params: PostParamsRequestType;
    Querystring: { lang: LangType; page: number };
    Reply: { 200: CollaborationStudioListResType; 500: ErrorResType };
  }>(
    "/collaboration_studio",
    { preHandler: [checkPathIsExist] },
    getCollaborationList
  );

  server.get<{
    Params: PostParamsRequestType;
    Querystring: { lang: LangType; page: number };
    Reply: { 200: CollaborationStudioProjectResType; 500: ErrorResType };
  }>(
    "/collaboration_studio/:title",
    { preHandler: [checkPathIsExist] },
    getCollaborationProject
  );
}

export default studiolabRoute;
