import { postPerPage } from "@/constants";
import {
  ActivitiesCardSchema,
  ActivitiesCardType,
  ActivitiesSchema,
  ActivitiesType,
} from "@/schemaValidation/activities.schema";
import { PageInfoType } from "@/schemaValidation/pageInfo.schema";
import {
  ActivitiesListResType,
  ActivitiesResType,
} from "@/types/activities.types";
import { ErrorResType } from "@/types/error.types";
import { getContentFiles } from "@/utils/fileHandler";
import {
  contentReader,
  infoPageReader,
  metadataMdReader,
} from "@/utils/MdHandler";
import { FastifyReply, FastifyRequest } from "fastify";
import path from "path";

async function getActivitiesList(
  request: FastifyRequest<{ Querystring: { page: number } }>,
  reply: FastifyReply<{
    Reply: { 200: ActivitiesListResType; 500: ErrorResType };
  }>
): Promise<void> {
  const dirPath: string = !request.path.isDir
    ? path.dirname(request.path.fullPath)
    : request.path.fullPath;

  const page: number = request.query.page || 1;

  try {
    const activitiesList: Array<ActivitiesCardType> = [];

    const files: Array<FileType> = [];

    await getContentFiles(dirPath, files);

    for (const file of files) {
      const filePath: string = file.fullPath;
      const content: ActivitiesCardType =
        await metadataMdReader<ActivitiesCardType>(
          filePath,
          ActivitiesCardSchema
        );

      if (!content.draft) activitiesList.push(content);
    }

    activitiesList.sort((actv1, actv2) => {
      const w1 = actv1.weight || 0;
      const w2 = actv2.weight || 0;

      return w2 - w1;
    });

    const headerPageInfo: PageInfoType = await infoPageReader(dirPath);

    reply.code(200).send({
      data: activitiesList.slice(
        (page - 1) * postPerPage,
        (page - 1) * postPerPage + postPerPage
      ),
      totalPage: Math.ceil(activitiesList.length / postPerPage),
      headerPageInfo: { ...headerPageInfo, title: "activities" },
      message: "Get Activities List Success",
    });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

async function getActivities(
  request: FastifyRequest,
  reply: FastifyReply<{ Reply: { 200: ActivitiesResType; 500: ErrorResType } }>
): Promise<void> {
  const activitiesPath: FileType = request.path;

  try {
    const content: ActivitiesType = await contentReader<ActivitiesType>(
      activitiesPath,
      ActivitiesSchema
    );

    reply.code(200).send({
      data: content,
      headerPageInfo: {
        title: content.title,
      },
      message: "Get Competition Detail Success",
    });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

export { getActivitiesList, getActivities };
