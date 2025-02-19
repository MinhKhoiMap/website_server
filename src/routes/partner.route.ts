import {
  createNewPartner,
  deletePartner,
  getAllPartners,
  updatePartner,
} from "@/controllers/partner.controller";
import { requiredLoginedHook } from "@/hooks/auth.hook";
import checkPathIsExist from "@/middlewares/checkPathIsExist";
import {
  PartnerCardSchema,
  PartnerCardType,
  UpdatePartnerBodyType,
} from "@/schemaValidation/partner.schema";
import { ErrorResType } from "@/types/error.types";
import {
  CreateUpdatePartnerType,
  PartnerListResType,
} from "@/types/partner.types";
import { FastifyInstance } from "fastify";

async function partnerRoute(server: FastifyInstance) {
  server.get<{
    Params: object;
    Querystring: { lang: LangType; page: number };
    Reply: { 200: PartnerListResType; 500: ErrorResType };
  }>("/", { preHandler: [checkPathIsExist] }, getAllPartners);

  server.post<{
    Params: object;
    Querystring: { lang: LangType };
    Reply: { 200: CreateUpdatePartnerType; 500: ErrorResType };
    Body: PartnerCardType;
  }>(
    "/:id",
    {
      preValidation: [requiredLoginedHook],
      schema: {
        body: PartnerCardSchema,
      },
    },
    createNewPartner
  );

  server.put<{
    Params: object;
    Querystring: { lang: LangType };
    Reply: { 200: CreateUpdatePartnerType; 500: ErrorResType };
    Body: UpdatePartnerBodyType;
  }>(
    "/:id",
    { preHandler: [checkPathIsExist], preValidation: [requiredLoginedHook] },
    updatePartner
  );

  server.delete<{
    Params: object;
    Querystring: { lang: LangType };
    Reply: {
      200: { message: string; data: PartnerCardType };
      500: ErrorResType;
    };
  }>(
    "/:id",
    { preValidation: [requiredLoginedHook], preHandler: [checkPathIsExist] },
    deletePartner
  );
}

export default partnerRoute;
