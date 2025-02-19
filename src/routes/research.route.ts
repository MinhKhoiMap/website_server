import {
  createProject,
  createPublication,
  getProjectDetail,
  getProjectList,
  getPublication,
  getPublicationList,
  updateProject,
  updatePublication,
} from "@/controllers/research.controller";
import { requiredLoginedHook } from "@/hooks/auth.hook";
import checkPathIsExist from "@/middlewares/checkPathIsExist";
import {
  CreateProjectBody,
  CreateProjectBodyType,
  CreatePublicationBody,
  CreatePublicationType,
  ProjectItemType,
  ProjectType,
  PublicationItemType,
  PublicationType,
  UpdateProjectBody,
  UpdatePublicationBody,
  UpdatePublicationType,
} from "@/schemaValidation/research.schema";
import { ErrorResType } from "@/types/error.types";
import {
  CreateUpdateResearchResType,
  ResearchListResType,
  ResearchParamsRequestType,
  ResearchResType,
} from "@/types/research.types";
import { FastifyInstance } from "fastify";

async function researchRoute(server: FastifyInstance) {
  server.get<{
    Params: ResearchParamsRequestType;
    Querystring: { lang: LangType; page: number };
    Reply: { 200: ResearchListResType<ProjectItemType>; 500: ErrorResType };
  }>("/project", { preHandler: [checkPathIsExist] }, getProjectList);

  server.get<{
    Params: ResearchParamsRequestType;
    Querystring: { lang: LangType; page: number };
    Reply: { 200: ResearchListResType<PublicationItemType>; 500: ErrorResType };
  }>("/publications", { preHandler: [checkPathIsExist] }, getPublicationList);

  server.get<{
    Params: ResearchParamsRequestType;
    Querystring: { lang: LangType; page: number };
    Reply: { 200: ResearchResType<ProjectType>; 500: ErrorResType };
  }>("/project/:slug", { preHandler: [checkPathIsExist] }, getProjectDetail);

  server.get<{
    Params: ResearchParamsRequestType;
    Querystring: { lang: LangType; page: number };
    Reply: { 200: ResearchResType<PublicationType>; 500: ErrorResType };
  }>("/publications/:slug", { preHandler: [checkPathIsExist] }, getPublication);

  server.post<{
    Body: CreateProjectBodyType;
    Params: ResearchParamsRequestType;
    Querystring: { lang: LangType };
    Reply: { 200: CreateUpdateResearchResType; 500: ErrorResType };
  }>(
    "/project/:slug",
    {
      preValidation: [requiredLoginedHook],
      schema: {
        body: CreateProjectBody,
      },
    },
    createProject
  );

  server.post<{
    Body: CreatePublicationType;
    Params: ResearchParamsRequestType;
    Querystring: { lang: LangType };
    Reply: { 200: CreateUpdateResearchResType; 500: ErrorResType };
  }>(
    "/publications/:slug",
    {
      preValidation: [requiredLoginedHook],
      schema: {
        body: CreatePublicationBody,
      },
    },
    createPublication
  );

  server.put<{
    Body: UpdateProjectBody;
    Params: ResearchParamsRequestType;
    Querystring: { lang: LangType };
    Reply: { 200: CreateUpdateResearchResType; 500: ErrorResType };
  }>(
    "/project/:slug",
    {
      preHandler: [checkPathIsExist],
      preValidation: [requiredLoginedHook],
      schema: {
        body: UpdateProjectBody,
      },
    },
    updateProject
  );

  server.put<{
    Body: UpdatePublicationType;
    Params: ResearchParamsRequestType;
    Querystring: { lang: LangType };
    Reply: { 200: CreateUpdateResearchResType; 500: ErrorResType };
  }>(
    "/publications/:slug",
    {
      preHandler: [checkPathIsExist],
      preValidation: [requiredLoginedHook],
      schema: {
        body: UpdatePublicationBody,
      },
    },
    updatePublication
  );
}

export default researchRoute;
