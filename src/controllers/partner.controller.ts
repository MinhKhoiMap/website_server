import fs from "fs";

import { contentDir } from "@/constants";
import { PageInfoType } from "@/schemaValidation/pageInfo.schema";
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
import { getContentFiles } from "@/utils/fileHandler";
import {
  contentReader,
  infoPageReader,
  metadataMdReader,
  updateContentFile,
  writeContentFile,
} from "@/utils/MdHandler";
import { FastifyReply, FastifyRequest } from "fastify";
import path from "path";

async function getAllPartners(
  request: FastifyRequest<{ Querystring: { page: number } }>,
  reply: FastifyReply<{ Reply: { 200: PartnerListResType; 500: ErrorResType } }>
): Promise<void> {
  const dirPath: string = !request.path.isDir
    ? path.dirname(request.path.fullPath)
    : request.path.fullPath;
  const page: number = request.query.page || 1;

  try {
    const partnerList: Array<PartnerCardType> = [];
    const files: Array<FileType> = [];

    await getContentFiles(dirPath, files);

    for (const file of files) {
      const filePath: string = file.fullPath;
      const content: PartnerCardType = await metadataMdReader<PartnerCardType>(
        filePath,
        PartnerCardSchema
      );
      if (!content.draft) partnerList.push(content);
    }

    partnerList.sort((partner1, partner2) => partner1.weight - partner2.weight);

    const headerPageInfo: PageInfoType = await infoPageReader(dirPath);

    reply.code(200).send({
      data: partnerList,

      headerPageInfo: { ...headerPageInfo, title: "partners" },
      message: "Get Partners Successfully",
    });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

async function createNewPartner(
  request: FastifyRequest<{
    Body: PartnerCardType;
    Querystring: { lang: LangType };
  }>,
  reply: FastifyReply<{
    Reply: { 200: CreateUpdatePartnerType; 500: ErrorResType };
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

  const partnerPath: FileType = {
    fullPath: path.format({
      dir: fullDir,
      name: fileName,
      ext: ".md",
    }),
    isDir: false,
  };

  try {
    const partnerParse = PartnerCardSchema.safeParse(body);

    const partner = {
      ...partnerParse.data,
      author: request.user.username,
    };

    writeContentFile(partnerPath, PartnerCardSchema, partner);

    const newContent: PartnerCardType = await contentReader<PartnerCardType>(
      partnerPath,
      PartnerCardSchema
    );

    reply.code(200).send({
      data: newContent,
      message: "Create Partner Successfully",
    });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

async function updatePartner(
  request: FastifyRequest<{
    Body: UpdatePartnerBodyType;
  }>,
  reply: FastifyReply<{
    Reply: { 200: CreateUpdatePartnerType; 500: ErrorResType };
  }>
) {
  const body = request.body;
  const partnerPath: FileType = request.path;

  try {
    const currentPartner: PartnerCardType =
      await metadataMdReader<PartnerCardType>(
        partnerPath.fullPath,
        PartnerCardSchema
      );

    const metadata = PartnerCardSchema.safeParse({
      ...currentPartner,
      ...body,
    });

    if (metadata.error) throw new Error(metadata.error.toString());

    updateContentFile(partnerPath, PartnerCardSchema, metadata.data);

    const newContent: PartnerCardType = await contentReader<PartnerCardType>(
      partnerPath,
      PartnerCardSchema
    );

    reply.code(200).send({
      data: newContent,
      message: "Update Partner Successfully",
    });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

async function deletePartner(
  request: FastifyRequest,
  reply: FastifyReply<{
    Reply: {
      200: { message: string; data: PartnerCardType };
      500: ErrorResType;
    };
  }>
) {
  const partnerPath: FileType = request.path;

  try {
    const deletedPartner: PartnerCardType =
      await contentReader<PartnerCardType>(partnerPath, PartnerCardSchema);

    fs.unlinkSync(partnerPath.fullPath);

    reply.code(200).send({
      data: deletedPartner,
      message: "Delete Partner Successfully",
    });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

export { getAllPartners, createNewPartner, updatePartner, deletePartner };
