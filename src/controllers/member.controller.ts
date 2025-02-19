import { contentDir, postPerPage } from "@/constants";
import {
  CreateMemberType,
  MemberCardSchema,
  MemberCardType,
  MemberMetadata,
  MemberMetadataType,
  MemberSchema,
  MemberType,
  UpdateMemberType,
} from "@/schemaValidation/member.schema";
import { PageInfoType } from "@/schemaValidation/pageInfo.schema";
import { MetaDataType } from "@/schemaValidation/post.schema";
import { ErrorResType } from "@/types/error.types";
import {
  CreateUpdateMemberResType,
  MemberListResType,
  MemberParamsRequestType,
  MemberResType,
} from "@/types/member.types";
import { getContentFiles } from "@/utils/fileHandler";
import {
  infoPageReader,
  contentReader,
  metadataMdReader,
  writeContentFile,
  updateContentFile,
} from "@/utils/MdHandler";
import { FastifyReply, FastifyRequest } from "fastify";
import path from "path";

async function getMemberList(
  request: FastifyRequest<{ Querystring: { page: number } }>,
  reply: FastifyReply<{ Reply: { 200: MemberListResType; 500: ErrorResType } }>
): Promise<void> {
  console.log(request.path);
  const dirPath: string = !request.path.isDir
    ? path.dirname(request.path.fullPath)
    : request.path.fullPath;

  const page: number = request.query.page || 1;
  try {
    const memberList: Array<MemberCardType> = [];

    const files: Array<FileType> = [];

    await getContentFiles(dirPath, files);

    for (const file of files) {
      const filePath: string = file.fullPath;
      const content: MemberCardType = await metadataMdReader<MemberCardType>(
        filePath,
        MemberCardSchema
      );

      if (!content.draft) memberList.push(content);
    }

    memberList.sort((member1, member2) => member1.weight - member2.weight);
    const headerPageInfo: PageInfoType = await infoPageReader(dirPath);

    // Reply
    reply.code(200).send({
      data: memberList.slice(
        (page - 1) * postPerPage,
        (page - 1) * postPerPage + postPerPage
      ),
      totalPage: Math.ceil(memberList.length / postPerPage),
      headerPageInfo: { ...headerPageInfo, title: "members" },
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

async function getMember(
  request: FastifyRequest,
  reply: FastifyReply<{ Reply: { 200: MemberResType; 500: ErrorResType } }>
): Promise<void> {
  const memberPath: FileType = request.path;
  try {
    const content: MemberType = await contentReader<MemberType>(
      memberPath,
      MemberSchema
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

async function createNewMember(
  request: FastifyRequest<{
    Body: CreateMemberType;
    Params: MemberParamsRequestType;
    Querystring: { lang: LangType };
  }>,
  reply: FastifyReply<{
    Reply: { 200: CreateUpdateMemberResType; 500: ErrorResType };
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

  const memberPath: FileType = {
    fullPath: path.format({
      dir: fullDir,
      name: fileName,
      ext: ".md",
    }),
    isDir: false,
  };

  try {
    console.log(memberPath);
    const memberParse = MemberSchema.safeParse({
      metadata: {
        ...body.metadata,
        id: path.basename(memberPath.fullPath, ".md"),
        author: request.user.username,
        description: "",
      },
      content: body.content,
    });

    if (memberParse.error) {
      throw new Error("Error parsing");
    }

    writeContentFile(memberPath, MemberSchema, memberParse.data);

    const newContent: MemberType = await contentReader<MemberType>(
      memberPath,
      MemberSchema
    );

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

async function updateMember(
  request: FastifyRequest<{
    Body: UpdateMemberType;
  }>,
  reply: FastifyReply<{
    Reply: { 200: CreateUpdateMemberResType; 500: ErrorResType };
  }>
) {
  const body = request.body;
  const memberPath: FileType = request.path;

  try {
    const currentMetadata: MemberMetadataType =
      await metadataMdReader<MemberMetadataType>(
        memberPath.fullPath,
        MemberMetadata
      );

    const metadata = MemberMetadata.safeParse({
      ...currentMetadata,
      ...body.metadata,
    });

    if (metadata.error) {
      throw new Error("Error parsing metadata");
    }

    updateContentFile(memberPath, MemberMetadata, metadata.data, body.content);

    const newContent: MemberType = await contentReader<MemberType>(
      memberPath,
      MemberSchema
    );

    reply.code(200).send({
      data: newContent,
      message: "Update Member Successfully",
    });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

export { getMemberList, getMember, createNewMember, updateMember };
