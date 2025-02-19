import {
  getCourseDetail,
  getCourseList,
} from "@/controllers/course.controller";
import checkPathIsExist from "@/middlewares/checkPathIsExist";
import {
  CourseListResType,
  CourseParamsRequestType,
  CourseResType,
} from "@/types/course.types";
import { ErrorResType } from "@/types/error.types";
import { FastifyInstance } from "fastify";

function courseRoute(server: FastifyInstance) {
  server.get<{
    Params: CourseParamsRequestType;
    Querystring: { lang: LangType; page: number };
    Reply: { 200: CourseListResType; 500: ErrorResType };
  }>("/:category", { preHandler: [checkPathIsExist] }, getCourseList);

  server.get<{
    Params: CourseParamsRequestType;
    Querystring: { lang: LangType; page: number };
    Reply: { 200: CourseResType; 500: ErrorResType };
  }>("/:category/:slug", { preHandler: [checkPathIsExist] }, getCourseDetail);
}

export default courseRoute;
