import { FastifyReply, FastifyRequest } from "fastify";
import { parse } from "date-fns";

import { ErrorResType } from "@/types/error.types";
import { PostParamsRequestType } from "@/types/post.types";
import {
  CreatePortalPostBodyType,
  PostSchema,
  PostType,
  UpdatePortalPostBodyType,
} from "@/schemaValidation/post.schema";
import { contentReader, writeContentFile } from "@/utils/MdHandler";

async function receiveNewPortalPostController(
  request: FastifyRequest<{
    Params: PostParamsRequestType;
    Querystring: { lang: LangType };
    Body: CreatePortalPostBodyType;
  }>,
  reply: FastifyReply<{
    Reply: { 200: { message: string }; 500: ErrorResType };
  }>
) {
  const postPath: FileType = request.path;
  const body: CreatePortalPostBodyType = request.body;

  try {
    const postParse = PostSchema.safeParse({
      metadata: {
        id: body.id,
        title: body.title,
        image: body.thumb,
        author: "UEH Portal",
        description: body.description,
        sdgs: body.sdgs,
        publishDate: parse(
          body.publishDate,
          "dd/MM/yyyy HH:mm:ss",
          new Date()
        ).toISOString(),
        location: "",
      },
      content: body.content,
    });
    if (postParse.error) {
      console.log(postParse.error, "receive from portal parse error");
      throw new Error("Error parsing");
    }

    writeContentFile(postPath, PostSchema, postParse.data);
    const newContent: PostType = await contentReader<PostType>(
      postPath,
      PostSchema
    );

    console.log(newContent);

    reply.code(200).send({
      message: "Create Post Successfully",
    });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

async function updatePortalPostController(
  request: FastifyRequest<{
    Params: PostParamsRequestType;
    Querystring: { lang: LangType };
    Body: UpdatePortalPostBodyType;
  }>,
  reply: FastifyReply<{
    Reply: { 200: { message: string }; 500: ErrorResType };
  }>
) {
  const postPath: FileType = request.path;
  const body: UpdatePortalPostBodyType = request.body;

  const currentPost = await contentReader<PostType>(postPath, PostSchema);
  const { content, ...metadata } = body;

  try {
    const postParse = PostSchema.safeParse({
      metadata: {
        ...currentPost.metadata,
        ...metadata,
      },
      content: content || currentPost.content,
    });

    if (postParse.error) {
      console.log(postParse.error, "update portal post error");
      throw new Error("Error parsing");
    }

    writeContentFile(postPath, PostSchema, postParse.data);

    reply.code(200).send({
      message: "Update Portal Post Successfully",
    });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

export { receiveNewPortalPostController, updatePortalPostController };
