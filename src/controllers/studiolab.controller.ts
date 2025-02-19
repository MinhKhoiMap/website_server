import { FastifyReply, FastifyRequest } from "fastify";
import path from "path";
import * as fs from "fs";

import { ErrorResType } from "@/types/error.types";
import {
  CollaborationStudioCard,
  CollaborationStudioCardType,
  CollaborationStudioProject,
  CollaborationStudioProjectType,
} from "@/schemaValidation/studiolab.schema";
import { getContentFiles } from "@/utils/fileHandler";
import {
  contentReader,
  infoPageReader,
  metadataMdReader,
} from "@/utils/MdHandler";
import {
  CollaborationStudioListResType,
  CollaborationStudioProjectResType,
} from "@/types/studiolab.type";
import { postPerPage } from "@/constants";
import { PageInfoType } from "@/schemaValidation/pageInfo.schema";
import { PostParamsRequestType } from "@/types/post.types";
import envConfig from "config";

async function getCollaborationList(
  request: FastifyRequest<{ Querystring: { page: number } }>,
  reply: FastifyReply<{
    Reply: { 200: CollaborationStudioListResType; 500: ErrorResType };
  }>
) {
  const dirPath: string = !request.path.isDir
    ? path.dirname(request.path.fullPath)
    : request.path.fullPath;

  const page: number = request.query.page || 1;

  try {
    const studio: Array<CollaborationStudioCardType> = [];

    const files: Array<FileType> = [];
    await getContentFiles(dirPath, files);

    for await (const file of files) {
      const filePath: string = file.fullPath;
      const metadata: CollaborationStudioCardType =
        await metadataMdReader<CollaborationStudioCardType>(
          filePath,
          CollaborationStudioCard
        );

      studio.push(metadata);
    }

    const headerPageInfo: PageInfoType = await infoPageReader(dirPath);

    reply.code(200).send({
      data: studio.slice(
        (page - 1) * postPerPage,
        (page - 1) * postPerPage + postPerPage
      ),
      totalPage: Math.ceil(studio.length / postPerPage),
      headerPageInfo: { ...headerPageInfo, title: "news" },
      message: `Get Studio List Success`,
    });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

async function getCollaborationProject(
  request: FastifyRequest<{ Params: PostParamsRequestType }>,
  reply: FastifyReply<{
    Reply: { 200: CollaborationStudioProjectResType; 500: ErrorResType };
  }>
) {
  const projectPath: FileType = request.path;

  try {
    const content: CollaborationStudioProjectType =
      await contentReader<CollaborationStudioProjectType>(
        projectPath,
        CollaborationStudioProject,
        {
          preSerialization(res) {
            const galleryPath = path.join(
              envConfig.MEDIA_UPLOAD_FOLDER,
              "studiolab",
              "collaboration",
              "thanhda",
              path.basename(projectPath.fullPath, ".md")
            );
            const imageListDir = fs.readdirSync(galleryPath);
            const gallery = [];

            for (const file of imageListDir) {
              const name = `${galleryPath}/${file}`.replaceAll("\\", "/");
              if (path.basename(name) !== path.basename(res.image))
                gallery.push(name);
            }
            res.galley = gallery;

            return res;
          },
        }
      );

    reply.code(200).send({
      data: content,
      headerPageInfo: {
        title: content.title,
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

export { getCollaborationList, getCollaborationProject };
