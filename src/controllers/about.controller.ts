import { PostSchema, PostType } from "@/schemaValidation/post.schema";
import { ErrorResType } from "@/types/error.types";
import { PostParamsRequestType, PostResType } from "@/types/post.types";
import { contentReader } from "@/utils/MdHandler";
import { FastifyReply, FastifyRequest } from "fastify";
import path from "path";

async function getAboutContent(
  request: FastifyRequest<{ Params: PostParamsRequestType }>,
  reply: FastifyReply<{ Reply: { 200: PostResType; 500: ErrorResType } }>
): Promise<void> {
  try {
    const contentPath: FileType = {
      fullPath: path.join(request.path.fullPath, "_index.md"),
      isDir: false,
    };

    const content: PostType = await contentReader(contentPath, PostSchema);
    reply.code(200).send({
      data: content,
      headerPageInfo: {
        title: content.metadata.title,
      },
      message: "Get About Successfully",
    });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

async function updateAboutContent(
  request: FastifyRequest<{ Params: PostParamsRequestType }>,
  reply: FastifyReply<{ Reply: { 200: PostResType; 500: ErrorResType } }>
) {}

export { getAboutContent };
