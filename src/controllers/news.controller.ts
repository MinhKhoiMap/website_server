import fs from "fs";
import path from "path";
import { pipeline } from "node:stream/promises";
import { FastifyReply, FastifyRequest } from "fastify";

import {
  CreateUpdateResType,
  PostListResType,
  PostParamsRequestType,
  PostResType,
} from "@/types/post.types";
import { getContentFiles } from "@/utils/fileHandler";
import {
  infoPageReader,
  contentReader,
  metadataMdReader,
  writeContentFile,
  updateContentFile,
} from "@/utils/MdHandler";
import { ErrorResType } from "@/types/error.types";
import {
  CreatePortalPostBody,
  CreatePortalPostBodyType,
  CreatePostBodyType,
  MetaDataSchema,
  MetaDataType,
  PostCardSchema,
  PostCardType,
  PostSchema,
  PostType,
  UpdatePostBodyType,
} from "@/schemaValidation/post.schema";
import { contentDir, postPerPage } from "@/constants";
import { PageInfoType } from "@/schemaValidation/pageInfo.schema";

async function getNewsList(
  request: FastifyRequest<{ Querystring: { page: number } }>,
  reply: FastifyReply<{ Reply: { 200: PostListResType; 500: ErrorResType } }>
): Promise<void> {
  const dirPath: string = !request.path.isDir
    ? path.dirname(request.path.fullPath)
    : request.path.fullPath;

  const page: number = request.query.page || 1;

  try {
    const postList: Array<PostCardType> = [];

    const files: Array<FileType> = [];
    await getContentFiles(dirPath, files);

    for (const file of files) {
      const filePath: string = file.fullPath;
      const content: PostCardType = await metadataMdReader<PostCardType>(
        filePath,
        PostCardSchema
      );

      if (request.user) postList.push(content);
      else {
        if (!content.draft) postList.push(content);
      }
    }

    postList.sort((post1, post2) => {
      if (new Date(post1.publishDate) < new Date(post2.publishDate)) {
        return 1;
      }
      return -1;
    });

    const headerPageInfo: PageInfoType = await infoPageReader(dirPath);

    // Reply
    reply.code(200).send({
      data: postList.slice(
        (page - 1) * postPerPage,
        (page - 1) * postPerPage + postPerPage
      ),
      totalPage: Math.ceil(postList.length / postPerPage),
      headerPageInfo: { ...headerPageInfo, title: "news" },
      message: `Get News List Success`,
    });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

async function getNews(
  request: FastifyRequest<{ Params: PostParamsRequestType }>,
  reply: FastifyReply<{ Reply: { 200: PostResType; 500: ErrorResType } }>
): Promise<void> {
  const postPath: FileType = request.path;
  try {
    const content: PostType = await contentReader<PostType>(
      postPath,
      PostSchema
    );

    reply.code(200).send({
      data: content,
      headerPageInfo: {
        title: content.metadata.title,
      },
      message: "Get News Post Success",
    });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

async function createNewsPost(
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

  const { image, ...meta } = body.metadata;

  try {
    // Handle Save Content Files
    const postParse = PostSchema.safeParse({
      metadata: {
        ...meta,
        image: image,
        id: path.basename(postPath.fullPath, ".md"),
        author: request.user.username,
        category: "cuocsong",
      },
      content: body.content,
    });

    const portalParse = CreatePortalPostBody.safeParse({
      ...meta,
      id: path.basename(postPath.fullPath, ".md"),
      category: 0,
      content: body.content,
      thumb: image,
    });

    if (postParse.error || portalParse.error) {
      console.log(postParse.error, "post parse error");
      console.log(portalParse.error, "portal post parse error");
      throw new Error("Error parsing");
    }

    writeContentFile(postPath, PostSchema, postParse.data);

    const newContent: PostType = await contentReader<PostType>(
      postPath,
      PostSchema
    );

    // Call API to post the new post to Portal Server

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

async function updateNewsPost(
  request: FastifyRequest<{ Body: UpdatePostBodyType }>,
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

    updateContentFile(postPath, MetaDataSchema, metadata.data, body.content);

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

async function deletePost(
  request: FastifyRequest,
  reply: FastifyReply<{
    Reply: {
      200: { message: string; data: PostCardType };
      500: ErrorResType;
    };
  }>
) {
  const postPath: FileType = request.path;

  try {
    const deletedPost: PostCardType = await contentReader<PostCardType>(
      postPath,
      PostCardSchema
    );

    fs.unlinkSync(postPath.fullPath);

    reply.code(200).send({
      data: deletedPost,
      message: "Delete Post Successfully",
    });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

export { getNewsList, getNews, createNewsPost, updateNewsPost, deletePost };
