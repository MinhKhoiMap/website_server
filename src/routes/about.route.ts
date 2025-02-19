import { getAboutContent } from "@/controllers/about.controller";
import checkPathIsExist from "@/middlewares/checkPathIsExist";
import { ErrorResType } from "@/types/error.types";
import { PostParamsRequestType, PostResType } from "@/types/post.types";
import { FastifyInstance } from "fastify";

async function aboutRoute(server: FastifyInstance) {
  server.get<{
    Params: PostParamsRequestType;
    Querystring: { lang: LangType; page: number };
    Reply: { 200: PostResType; 500: ErrorResType };
  }>("/", { preHandler: [checkPathIsExist] }, getAboutContent);

  server.post<{
    Params: PostParamsRequestType;
    Querystring: { lang: LangType; page: number };
    Reply: { 200: PostResType; 500: ErrorResType };
  }>("/", { preHandler: [checkPathIsExist] }, () => {});
}

export default aboutRoute;
