import { FastifyInstance } from "fastify";

import {
  createNewsPost,
  deletePost,
  getNews,
  getNewsList,
  updateNewsPost,
} from "@/controllers/news.controller";
import { checkIsLogined, requiredLoginedHook } from "@/hooks/auth.hook";
import checkPathIsExist from "@/middlewares/checkPathIsExist";
import {
  CreatePostBody,
  CreatePostBodyType,
  PostCardType,
  UpdatePostBody,
  UpdatePostBodyType,
} from "@/schemaValidation/post.schema";
import { ErrorResType } from "@/types/error.types";
import {
  CreateUpdateResType,
  PostListResType,
  PostParamsRequestType,
  PostResType,
} from "@/types/post.types";

async function newsRoute(server: FastifyInstance) {
  server.get<{
    Params: PostParamsRequestType;
    Querystring: {
      lang: LangType;
      page: number;
      postPerPage: number | undefined;
    };
    Reply: { 200: PostListResType; 500: ErrorResType };
  }>(
    "/",
    { preHandler: [checkPathIsExist<PostParamsRequestType>, checkIsLogined] },
    getNewsList
  );

  server.get<{
    Params: PostParamsRequestType;
    Querystring: { lang: LangType };
    Reply: { 200: PostResType; 500: ErrorResType };
  }>("/:title", { preHandler: [checkPathIsExist] }, getNews);

  server.post<{
    Reply: { 200: CreateUpdateResType; 500: ErrorResType };
    Querystring: { lang: LangType };
    Body: CreatePostBodyType;
    Params: PostParamsRequestType;
  }>("/:title", { preValidation: [requiredLoginedHook] }, createNewsPost);

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
    updateNewsPost
  );

  server.delete<{
    Params: object;
    Querystring: { lang: LangType };
    Reply: {
      200: { message: string; data: PostCardType };
      500: ErrorResType;
    };
  }>(
    "/:id",
    { preValidation: [requiredLoginedHook], preHandler: [checkPathIsExist] },
    deletePost
  );
}

export default newsRoute;
