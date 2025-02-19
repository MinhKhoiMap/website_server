import z from "zod";

export const MetaDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  publishDate: z.string().default(new Date().toISOString()),
  draft: z.boolean().default(false),
  image: z.string().transform((url) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    url = url.startsWith("/") ? url : "/" + url;
    return `http://${process.env.SERVER_HOST_NAME}:${process.env.SERVER_PORT}/${process.env.STATIC_DIR}/static${url}`;
  }),
  showImage: z.boolean().default(false),
  author: z.string().default("unknown"),
  description: z.string().default(""),
  location: z.string().default("ISCM, Ho Chi Minh City, Vietnam"),
  category: z.string().optional(),
  sdgs: z.number().array().nonempty().max(3).optional(),
});

export type MetaDataType = z.TypeOf<typeof MetaDataSchema>;

export const PostSchema = z
  .object({
    content: z.string(),
    metadata: MetaDataSchema,
  })
  .describe("metadata");

export type PostType = z.TypeOf<typeof PostSchema>;

export const PostCardSchema = z.object({
  title: z.string(),
  publishDate: z.string(),
  draft: z.boolean().default(false),
  image: z.string().transform((url) => {
    url = url.startsWith("/") ? url : "/" + url;
    return `http://${process.env.SERVER_HOST_NAME}:${process.env.SERVER_PORT}/${process.env.STATIC_DIR}/static${url}`;
  }),
  id: z.string(),
});

export type PostCardType = z.TypeOf<typeof PostCardSchema>;

export const CreatePostBody = z.object({
  metadata: z.object({
    title: z.string().min(1),
    image: z.string().transform((imgName) => {
      if (imgName.startsWith("/images")) return imgName;

      return `/images/${imgName}`;
    }),
    draft: z.boolean(),
    showImage: z.boolean().default(false),
    publishDate: z.string().default(new Date().toISOString()),
    sdgs: z.number().array().nonempty().max(3),
    description: z.string(),
  }),
  content: z.string().min(1),
});

export type CreatePostBodyType = z.TypeOf<typeof CreatePostBody>;

export const UpdatePostBody = z.object({
  metadata: z
    .object({
      title: z.string().min(1).optional(),
      image: z
        .string()
        .transform((imgName) => {
          if (imgName.startsWith("/images")) return imgName;

          return `/images/${imgName}`;
        })
        .optional(),
      draft: z.boolean().optional(),
      showImage: z.boolean().default(false).optional(),
      publishDate: z.string().default(new Date().toISOString()).optional(),
    })
    .optional(),
  content: z.string().min(1).optional(),
  imageUploads: z.any().optional(),
});

export type UpdatePostBodyType = z.TypeOf<typeof UpdatePostBody>;

export const CreatePortalPostBody = z.object({
  id: z.string(),
  title: z.string(),
  publishDate: z.string().default(new Date().toISOString()),
  thumb: z.string(),
  content: z.string(),
  description: z.string(),
  sdgs: z.number().array().nonempty().max(3),
  category: z.number(),
});

export type CreatePortalPostBodyType = z.TypeOf<typeof CreatePortalPostBody>;

export const UpdatePortalPostBody = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  thumb: z
    .string()
    .transform((imgName) => {
      if (imgName.startsWith("/images")) return imgName;

      return `/images/${imgName}`;
    })
    .optional(),
  content: z.string().min(1).optional(),
  category: z.number().optional(),
  description: z.string().optional(),
  sdgs: z.number().array().nonempty().max(3).optional(),
});

export type UpdatePortalPostBodyType = z.TypeOf<typeof UpdatePortalPostBody>;
