import { FastifyInstance } from "fastify";

import {
  createNewMember,
  getMember,
  getMemberList,
  updateMember,
} from "@/controllers/member.controller";
import checkPathIsExist from "@/middlewares/checkPathIsExist";
import {
  CreateUpdateMemberResType,
  MemberListResType,
  MemberParamsRequestType,
  MemberResType,
} from "@/types/member.types";
import { ErrorResType } from "@/types/error.types";
import {
  CreateMemberBody,
  CreateMemberType,
  UpdateMemberBody,
  UpdateMemberType,
} from "@/schemaValidation/member.schema";
import { requiredLoginedHook } from "@/hooks/auth.hook";

async function memberRoute(server: FastifyInstance) {
  server.get<{
    Params: MemberParamsRequestType;
    Querystring: { lang: LangType; page: number };
    Reply: { 200: MemberListResType; 500: ErrorResType };
  }>("/:category", { preHandler: [checkPathIsExist] }, getMemberList);

  server.get<{
    Params: MemberParamsRequestType;
    Querystring: { lang: LangType; page: number };
    Reply: { 200: MemberResType; 500: ErrorResType };
  }>("/:category/:id_member", { preHandler: [checkPathIsExist] }, getMember);

  server.post<{
    Querystring: { lang: LangType };
    Body: CreateMemberType;
    Params: MemberParamsRequestType;
    Reply: { 200: CreateUpdateMemberResType; 500: ErrorResType };
  }>(
    "/:category/:id_member",
    {
      preValidation: [requiredLoginedHook],
      schema: {
        body: CreateMemberBody,
      },
    },
    createNewMember
  );

  server.put<{
    Querystring: { lang: LangType };
    Body: UpdateMemberType;
    Params: MemberParamsRequestType;
    Reply: { 200: CreateUpdateMemberResType; 500: ErrorResType };
  }>(
    "/:category/:id_member",
    {
      preHandler: [checkPathIsExist],
      preValidation: [requiredLoginedHook],
      schema: {
        body: UpdateMemberBody,
      },
    },
    updateMember
  );
}

export default memberRoute;
