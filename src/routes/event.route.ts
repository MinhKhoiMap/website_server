import { FastifyInstance } from "fastify";
import {
  CreateUpdateResType,
  PostListResType,
  PostParamsRequestType,
  PostResType,
} from "@/types/post.types";
import { ErrorResType } from "@/types/error.types";
import checkPathIsExist from "@/middlewares/checkPathIsExist";
import {
  createEventPost,
  getEventList,
  getEventPost,
  updateEventPost,
} from "@/controllers/event.controller";
import { requiredLoginedHook } from "@/hooks/auth.hook";
import {
  CreatePostBody,
  CreatePostBodyType,
  UpdatePostBody,
  UpdatePostBodyType,
} from "@/schemaValidation/post.schema";

async function eventRoute(server: FastifyInstance) {
  server.get<{
    Params: PostParamsRequestType;
    Querystring: { lang: LangType; page: number };
    Reply: { 200: PostListResType; 500: ErrorResType };
  }>(
    "/",
    { preHandler: [checkPathIsExist<PostParamsRequestType>] },
    getEventList
  );

  server.get<{
    Params: PostParamsRequestType;
    Querystring: { lang: LangType };
    Reply: { 200: PostResType; 500: ErrorResType };
  }>("/:title", { preHandler: [checkPathIsExist] }, getEventPost);

  server.post<{
    Reply: { 200: CreateUpdateResType; 500: ErrorResType };
    Querystring: { lang: LangType };
    Body: CreatePostBodyType;
    Params: PostParamsRequestType;
  }>(
    "/:title",
    {
      preValidation: [requiredLoginedHook],
      schema: {
        body: CreatePostBody,
      },
    },
    createEventPost
  );

  server.put<{
    Reply: { 200: CreateUpdateResType; 500: ErrorResType };
    Querystring: { lang: LangType };
    Body: UpdatePostBodyType;
    Params: PostParamsRequestType;
  }>(
    "/:title",
    {
      preHandler: [checkPathIsExist],
      preValidation: [requiredLoginedHook],
      schema: {
        body: UpdatePostBody,
      },
    },
    updateEventPost
  );
}

export default eventRoute;
