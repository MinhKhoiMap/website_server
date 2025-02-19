import { FastifyInstance } from "fastify";
import checkPathIsExist from "@/middlewares/checkPathIsExist";
import {
  getActivities,
  getActivitiesList,
} from "@/controllers/activities.controller";
import {
  ActivitiesListResType,
  ActivitiesParamsRequestType,
  ActivitiesResType,
} from "@/types/activities.types";
import { ErrorResType } from "@/types/error.types";

async function activitiesRoute(server: FastifyInstance) {
  server.get<{
    Params: ActivitiesParamsRequestType;
    Querystring: { lang: LangType; page: number };
    Reply: { 200: ActivitiesListResType; 500: ErrorResType };
  }>("/", { preHandler: [checkPathIsExist] }, getActivitiesList);

  server.get<{
    Params: ActivitiesParamsRequestType;
    Querystring: { lang: LangType; page: number };
    Reply: { 200: ActivitiesResType; 500: ErrorResType };
  }>("/:slug", { preHandler: [checkPathIsExist] }, getActivities);
}

export default activitiesRoute;
