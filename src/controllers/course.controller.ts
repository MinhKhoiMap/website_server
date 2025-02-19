import { postPerPage } from "@/constants";
import {
  CourseCardSchema,
  CourseCardType,
  CourseSchema,
  CourseType,
} from "@/schemaValidation/course.schema";
import { PageInfoType } from "@/schemaValidation/pageInfo.schema";
import { CourseListResType, CourseResType } from "@/types/course.types";
import { ErrorResType } from "@/types/error.types";
import { getContentFiles } from "@/utils/fileHandler";
import {
  contentReader,
  infoPageReader,
  metadataMdReader,
} from "@/utils/MdHandler";
import { FastifyReply, FastifyRequest } from "fastify";
import path from "path";

async function getCourseList(
  request: FastifyRequest<{
    Querystring: { page: number };
    Params: { slug: string };
  }>,
  reply: FastifyReply<{ Reply: { 200: CourseListResType; 500: ErrorResType } }>
): Promise<void> {
  const dirPath: string = !request.path.isDir
    ? path.dirname(request.path.fullPath)
    : request.path.fullPath;

  const page: number = request.query.page || 1;
  try {
    const courseList: Array<CourseCardType> = [];

    const files: Array<FileType> = [];

    await getContentFiles(dirPath, files);

    for (const file of files) {
      const filePath: string = file.fullPath;
      const content: CourseCardType = await metadataMdReader<CourseCardType>(
        filePath,
        CourseCardSchema
      );

      if (!content.draft) courseList.push(content);
    }

    courseList.sort((c1, c2) => c1.weight - c2.weight);
    const headerPageInfo: PageInfoType = await infoPageReader(dirPath);

    reply.code(200).send({
      data: courseList.slice(
        (page - 1) * postPerPage,
        (page - 1) * postPerPage + postPerPage
      ),
      totalPage: Math.ceil(courseList.length / postPerPage),
      headerPageInfo: {
        ...headerPageInfo,
        title: `course_${request.params.slug}`,
      },
      message: "Get News List Success",
    });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

async function getCourseDetail(
  request: FastifyRequest,
  reply: FastifyReply<{ Reply: { 200: CourseResType; 500: ErrorResType } }>
): Promise<void> {
  const coursePath: FileType = request.path;

  try {
    const content: CourseType = await contentReader<CourseType>(
      coursePath,
      CourseSchema
    );

    reply.code(200).send({
      data: content,
      headerPageInfo: {
        title: content.title,
      },
      message: "Get Course Post Success",
    });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

export { getCourseList, getCourseDetail };
