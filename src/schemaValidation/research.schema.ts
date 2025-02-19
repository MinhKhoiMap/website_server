import z from "zod";

export const ProjectMetadata = z.object({
  title: z.string(),
  image: z
    .string()
    .transform((url) => {
      url = url.startsWith("/") ? url : "/" + url;
      return `http://${process.env.SERVER_HOST_NAME}:${process.env.SERVER_PORT}/${process.env.STATIC_DIR}/static${url}`;
    })
    .optional(),
  description: z.string().default(""),
  draft: z.boolean().default(false),
  author: z.string().default("unknown"),
});

export type ProjectMetadataType = z.TypeOf<typeof ProjectMetadata>;

export const ProjectSchema = z
  .object({
    metadata: ProjectMetadata,
    content: z.string(),
  })
  .describe("metadata");

export type ProjectType = z.TypeOf<typeof ProjectSchema>;

export const UpdateProjectBody = z.object({
  metadata: z
    .object({
      title: z.string().optional(),
      image: z
        .string()
        .transform((url) => {
          if (!url) return null;
          url = url.startsWith("/") ? url : "/" + url;
          return `http://${process.env.SERVER_HOST_NAME}:${process.env.SERVER_PORT}/${process.env.STATIC_DIR}/static${url}`;
        })
        .optional(),
      description: z.string().optional(),
      draft: z.boolean().optional(),
    })
    .optional(),
  content: z.string().optional(),
});

export type UpdateProjectBody = z.TypeOf<typeof UpdateProjectBody>;

export const CreateProjectBody = z.object({
  metadata: z.object({
    title: z.string().min(1),
    image: z.string().optional(),
    description: z.string().default(""),
    draft: z.boolean().default(false),
  }),
  content: z.string().min(1),
});

export type CreateProjectBodyType = z.TypeOf<typeof CreateProjectBody>;

export const ProjectItemSchema = z.object({
  title: z.string(),
  id: z.string(),
  draft: z.boolean().default(false),
});

export type ProjectItemType = z.TypeOf<typeof ProjectItemSchema>;

//  ---------------------------------------------------------------- publications ----------------------------------------------------------------

export const PublicationSchema = z.object({
  title: z.string(),
  image: z.string().transform((url) => {
    url = url.startsWith("/") ? url : "/" + url;
    return `http://${process.env.SERVER_HOST_NAME}:${process.env.SERVER_PORT}/${process.env.STATIC_DIR}/static${url}`;
  }),
  authors: z.array(
    z.object({
      name: z.string(),
      title: z.string(),
    })
  ),
  doi: z.string(),
  keywords: z.string(),
  citation: z.string(),
  description: z.string().default(""),
  abstract: z.string(),
  author: z.string().default("unknown"),
});

export type PublicationType = z.TypeOf<typeof PublicationSchema>;

export const CreatePublicationBody = z.object({
  title: z.string(),
  image: z.string().transform((url) => {
    url = url.startsWith("/") ? url : "/" + url;
    return `http://${process.env.SERVER_HOST_NAME}:${process.env.SERVER_PORT}/${process.env.STATIC_DIR}/static${url}`;
  }),
  authors: z.array(
    z.object({
      name: z.string(),
      title: z.string(),
    })
  ),
  doi: z.string(),
  keywords: z.string(),
  citation: z.string(),
  description: z.string().default(""),
  abstract: z.string(),
});

export type CreatePublicationType = z.TypeOf<typeof CreatePublicationBody>;

export const UpdatePublicationBody = z.object({
  title: z.string().optional(),
  image: z
    .string()
    .transform((url) => {
      if (!url) return null;
      url = url.startsWith("/") ? url : "/" + url;
      return `http://${process.env.SERVER_HOST_NAME}:${process.env.SERVER_PORT}/${process.env.STATIC_DIR}/static${url}`;
    })
    .optional(),
  authors: z
    .array(
      z.object({
        name: z.string(),
        title: z.string(),
      })
    )
    .optional(),
  doi: z.string().optional(),
  keywords: z.string().optional(),
  citation: z.string().optional(),
  description: z.string().optional(),
  abstract: z.string().optional(),
});

export type UpdatePublicationType = z.TypeOf<typeof UpdatePublicationBody>;

export const PublicationItemSchema = z.object({
  title: z.string(),
  id: z.string(),
  authors: z.array(
    z.object({
      name: z.string(),
      title: z.string(),
    })
  ),
});

export type PublicationItemType = z.TypeOf<typeof PublicationItemSchema>;
