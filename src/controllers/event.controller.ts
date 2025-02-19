import path from "path";
import { FastifyReply, FastifyRequest } from "fastify";

// Import types
import {
  CreateUpdateResType,
  PostListResType,
  PostParamsRequestType,
  PostResType,
} from "@/types/post.types";
import { ErrorResType } from "@/types/error.types";
import {
  CreatePostBodyType,
  MetaDataSchema,
  MetaDataType,
  PostCardSchema,
  PostCardType,
  PostSchema,
  PostType,
  UpdatePostBodyType,
} from "@/schemaValidation/post.schema";

// Import Utils
import { contentDir, postPerPage } from "@/constants";
import { getContentFiles } from "@/utils/fileHandler";
import {
  infoPageReader,
  contentReader,
  metadataMdReader,
  writeContentFile,
  updateContentFile,
} from "@/utils/MdHandler";

async function getEventList(
  request: FastifyRequest<{ Querystring: { page: number } }>,
  reply: FastifyReply<{ Reply: { 200: PostListResType; 500: ErrorResType } }>
): Promise<void> {
  const dirPath = !request.path.isDir
    ? path.dirname(request.path.fullPath)
    : request.path.fullPath;

  const page = request.query.page || 1;

  try {
    const postList: Array<PostCardType> = [];

    const files: Array<FileType> = [];
    await getContentFiles(dirPath, files);

    for (const file of files) {
      const filePath = file.fullPath;
      const content: PostCardType = await metadataMdReader(
        filePath,
        PostCardSchema
      );
      if (!content.draft) postList.push(content);
    }

    postList.sort((post1, post2) => {
      if (new Date(post1.publishDate) < new Date(post2.publishDate)) {
        return 1;
      }
      return -1;
    });

    const headerPageInfo = await infoPageReader(dirPath);

    reply.code(200).send({
      data: postList.slice(
        (page - 1) * postPerPage,
        (page - 1) * postPerPage + postPerPage
      ),
      totalPage: Math.ceil(postList.length / postPerPage),
      headerPageInfo: { ...headerPageInfo, title: "Event" },
      message: "Get News List Success",
    });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    return reply.code(500).send({
      message: e.message,
    });
  }
}

async function getEventPost(
  request: FastifyRequest<{ Params: PostParamsRequestType }>,
  reply: FastifyReply<{ Reply: { 200: PostResType; 500: ErrorResType } }>
) {
  try {
    const postPath = request.path;
    const content: PostType = await contentReader(postPath, PostSchema);

    reply.code(200).send({
      data: content,
      headerPageInfo: { title: "Event" },
      message: "Get News Post Success",
    });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    return reply.code(500).send({
      message: e.message,
    });
  }
}

async function createEventPost(
  request: FastifyRequest<{
    Body: CreatePostBodyType;
    Params: PostParamsRequestType;
    Querystring: { lang: LangType };
  }>,
  reply: FastifyReply<{
    Reply: { 200: CreateUpdateResType; 500: ErrorResType };
  }>
) {
  const body = request.body;
  const lang: LangType = request.query.lang || "en";

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

  const postPath: FileType = {
    fullPath: path.format({
      dir: fullDir,
      name: fileName,
      ext: ".md",
    }),
    isDir: false,
  };

  try {
    const postParse = PostSchema.safeParse({
      metadata: {
        ...body.metadata,
        id: path.basename(postPath.fullPath, ".md"),
        author: request.user.username,
        description: "",
      },
      content: body.content,
    });

    if (postParse.error) {
      throw new Error("Error parsing");
    }

    writeContentFile(postPath, postParse.data);

    const newContent: PostType = await contentReader<PostType>(
      postPath,
      PostSchema
    );

    reply.code(200).send({
      data: newContent,
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

async function updateEventPost(
  request: FastifyRequest<{
    Body: UpdatePostBodyType;
    Params: PostParamsRequestType;
    Querystring: { lang: LangType };
  }>,
  reply: FastifyReply<{
    Reply: { 200: CreateUpdateResType; 500: ErrorResType };
  }>
) {
  const body = request.body;
  const postPath: FileType = request.path;

  try {
    const currentMetadata: MetaDataType = await metadataMdReader<MetaDataType>(
      postPath.fullPath,
      MetaDataSchema
    );

    const metadata = MetaDataSchema.safeParse({
      ...currentMetadata,
      ...body.metadata,
    });

    if (metadata.error) {
      throw new Error("Error parsing metadata");
    }

    updateContentFile(postPath, metadata.data, body.content);

    const newContent: PostType = await contentReader<PostType>(
      postPath,
      PostSchema
    );

    reply.code(200).send({
      data: newContent,
      message: "Update Post Successfully",
    });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

export { getEventList, getEventPost, createEventPost, updateEventPost };
