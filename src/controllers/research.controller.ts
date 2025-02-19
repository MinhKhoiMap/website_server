import path from "path";
import {
  CreateProjectBodyType,
  CreatePublicationType,
  ProjectItemSchema,
  ProjectItemType,
  ProjectMetadata,
  ProjectMetadataType,
  ProjectSchema,
  ProjectType,
  PublicationItemSchema,
  PublicationItemType,
  PublicationSchema,
  PublicationType,
  UpdateProjectBody,
  UpdatePublicationType,
} from "@/schemaValidation/research.schema";
import { ErrorResType } from "@/types/error.types";
import {
  CreateUpdateResearchResType,
  ResearchListResType,
  ResearchParamsRequestType,
  ResearchResType,
} from "@/types/research.types";
import { FastifyReply, FastifyRequest } from "fastify";
import { getContentFiles } from "@/utils/fileHandler";
import {
  infoPageReader,
  contentReader,
  metadataMdReader,
  writeContentFile,
  updateContentFile,
} from "@/utils/MdHandler";
import { PageInfoType } from "@/schemaValidation/pageInfo.schema";
import { contentDir } from "@/constants";

async function getProjectList(
  request: FastifyRequest,
  reply: FastifyReply<{
    Reply: { 200: ResearchListResType<ProjectItemType>; 500: ErrorResType };
  }>
): Promise<void> {
  const dirPath: string = !request.path.isDir
    ? path.dirname(request.path.fullPath)
    : request.path.fullPath;
  try {
    const projectList: Array<ProjectItemType> = [];
    const files: Array<FileType> = [];

    await getContentFiles(dirPath, files);

    for (const file of files) {
      const filePath: string = file.fullPath;
      const content: ProjectItemType = await metadataMdReader<ProjectItemType>(
        filePath,
        ProjectItemSchema
      );

      if (!content.draft) projectList.push(content);
    }

    const headerPageInfo: PageInfoType = await infoPageReader(dirPath);

    reply.code(200).send({
      data: projectList,
      headerPageInfo: { ...headerPageInfo, title: "Research" },
      message: "Get Project List Success",
    });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

async function getProjectDetail(
  request: FastifyRequest,
  reply: FastifyReply<{
    Reply: { 200: ResearchResType<ProjectType>; 500: ErrorResType };
  }>
): Promise<void> {
  const projectDetailPath: FileType = request.path;

  try {
    const project: ProjectType = await contentReader<ProjectType>(
      projectDetailPath,
      ProjectSchema
    );

    reply.code(200).send({
      data: project,
      headerPageInfo: {
        title: project.metadata.title,
      },
      message: "Get Project Success",
    });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

async function getPublicationList(
  request: FastifyRequest,
  reply: FastifyReply<{
    Reply: { 200: ResearchListResType<PublicationItemType>; 500: ErrorResType };
  }>
): Promise<void> {
  const dirPath: string = !request.path.isDir
    ? path.dirname(request.path.fullPath)
    : request.path.fullPath;
  try {
    const publicationList: Array<PublicationItemType> = [];
    const files: Array<FileType> = [];

    await getContentFiles(dirPath, files);

    for (const file of files) {
      const filePath: string = file.fullPath;
      const content: PublicationItemType = await metadataMdReader(
        filePath,
        PublicationItemSchema
      );

      publicationList.push(content);
    }

    const headerPageInfo: PageInfoType = await infoPageReader(dirPath);

    reply.code(200).send({
      data: publicationList,
      headerPageInfo: { ...headerPageInfo, title: "research" },
      message: "Get Publication List Success",
    });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

async function getPublication(
  request: FastifyRequest,
  reply: FastifyReply<{
    Reply: { 200: ResearchResType<PublicationType>; 500: ErrorResType };
  }>
): Promise<void> {
  const publicationPath: FileType = request.path;

  try {
    const content: PublicationType = await contentReader<PublicationType>(
      publicationPath,
      PublicationSchema
    );

    reply.code(200).send({
      data: content,
      headerPageInfo: {
        title: content.title,
      },
      message: "Get Publication Success",
    });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

async function createProject(
  request: FastifyRequest<{
    Body: CreateProjectBodyType;
    Params: ResearchParamsRequestType;
    Querystring: { lang: LangType };
  }>,
  reply: FastifyReply<{
    Reply: { 200: CreateUpdateResearchResType; 500: ErrorResType };
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

  const projectPath: FileType = {
    fullPath: path.format({
      dir: fullDir,
      name: fileName,
      ext: ".md",
    }),
    isDir: false,
  };

  try {
    const projectParse = ProjectSchema.safeParse({
      metadata: {
        ...body.metadata,
        id: path.basename(projectPath.fullPath, ".md"),
        author: request.user.username,
        description: "",
      },
      content: body.content,
    });

    if (projectParse.error) {
      throw new Error("Error parsing");
    }

    writeContentFile(projectPath, ProjectSchema, projectParse.data);

    const newContent: ProjectType = await contentReader<ProjectType>(
      projectPath,
      ProjectSchema
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

async function createPublication(
  request: FastifyRequest<{
    Body: CreatePublicationType;
    Params: ResearchParamsRequestType;
    Querystring: { lang: LangType };
  }>,
  reply: FastifyReply<{
    Reply: { 200: CreateUpdateResearchResType; 500: ErrorResType };
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

  const publicationPath: FileType = {
    fullPath: path.format({
      dir: fullDir,
      name: fileName,
      ext: ".md",
    }),
    isDir: false,
  };

  try {
    const publicationParse = PublicationSchema.safeParse({
      ...body,
      author: request.user.username,
      description: "",
    });

    if (publicationParse.error) {
      throw new Error("Error parsing");
    }

    writeContentFile(publicationPath, PublicationSchema, publicationParse.data);

    const newContent: PublicationType = await contentReader<PublicationType>(
      publicationPath,
      PublicationSchema
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

async function updateProject(
  request: FastifyRequest<{ Body: UpdateProjectBody }>,
  reply: FastifyReply<{
    Reply: { 200: CreateUpdateResearchResType; 500: ErrorResType };
  }>
) {
  const body = request.body;
  const projectPath: FileType = request.path;

  try {
    const currentProjectMeta: ProjectMetadataType =
      await metadataMdReader<ProjectMetadataType>(
        projectPath.fullPath,
        ProjectMetadata
      );

    const metadata = ProjectMetadata.safeParse({
      ...currentProjectMeta,
      ...body.metadata,
      author: request.user.username,
    });

    if (metadata.error) {
      throw new Error("Error parsing metadata");
    }

    updateContentFile(
      projectPath,
      ProjectMetadata,
      metadata.data,
      body.content
    );

    const newContent: ProjectType = await contentReader<ProjectType>(
      projectPath,
      ProjectSchema
    );

    reply.code(200).send({
      data: newContent,
      message: "Update Post Successfully",
    });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

async function updatePublication(
  request: FastifyRequest<{ Body: UpdatePublicationType }>,
  reply: FastifyReply<{
    Reply: { 200: CreateUpdateResearchResType; 500: ErrorResType };
  }>
) {
  const body = request.body;
  const publicationPath: FileType = request.path;

  try {
    const currentProjectMeta: PublicationType =
      await metadataMdReader<PublicationType>(
        publicationPath.fullPath,
        PublicationSchema
      );

    const metadata = PublicationSchema.safeParse({
      ...currentProjectMeta,
      ...body,
      author: request.user.username,
    });

    if (metadata.error) {
      throw new Error("Error parsing metadata" + metadata.error);
    }

    updateContentFile(publicationPath, PublicationSchema, metadata.data);

    const newContent: PublicationType = await contentReader<PublicationType>(
      publicationPath,
      PublicationSchema
    );

    reply.code(200).send({
      data: newContent,
      message: "Update Post Successfully",
    });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

export {
  getProjectList,
  getProjectDetail,
  getPublicationList,
  getPublication,
  createProject,
  createPublication,
  updateProject,
  updatePublication,
};
