import z from "zod";

export const MemberMetadata = z.object({
  title: z.string(),
  course: z.string(),
  image: z.string().transform((url) => {
    url = url.startsWith("/") ? url : "/" + url;
    return `http://${process.env.SERVER_HOST_NAME}:${process.env.SERVER_PORT}/${process.env.STATIC_DIR}/static${url}`;
  }),
  interest: z.array(z.string()).nullable().default(null),
  bio: z.string(),
  contact: z
    .array(
      z.object({
        icon: z.string(),
        link: z.string(),
      })
    )
    .nullable()
    .default(null),
});

export type MemberMetadataType = z.TypeOf<typeof MemberMetadata>;

export const MemberSchema = z
  .object({
    metadata: MemberMetadata,
    content: z.string(),
  })
  .describe("metadata");

export type MemberType = z.TypeOf<typeof MemberSchema>;

export const MemberCardSchema = z.object({
  title: z.string(),
  course: z.string(),
  weight: z.number().default(-1),
  draft: z.boolean().default(false),
  image: z.string().transform((url) => {
    url = url.startsWith("/") ? url : "/" + url;
    return `http://${process.env.SERVER_HOST_NAME}:${process.env.SERVER_PORT}/${process.env.STATIC_DIR}/static${url}`;
  }),
  id: z.string(),
});

export type MemberCardType = z.TypeOf<typeof MemberCardSchema>;

export const CreateMemberBody = z.object({
  metadata: z.object({
    title: z.string().min(1),
    course: z.string().min(1),
    image: z.string().transform((url) => {
      url = url.startsWith("/") ? url : "/" + url;
      return `http://${process.env.SERVER_HOST_NAME}:${process.env.SERVER_PORT}/${process.env.STATIC_DIR}/static${url}`;
    }),
    interest: z.array(z.string()).nullable().default(null),
    bio: z.string(),
    contact: z
      .array(
        z.object({
          icon: z.string(),
          link: z.string(),
        })
      )
      .nullable()
      .default(null),
  }),
  content: z.string(),
});

export type CreateMemberType = z.TypeOf<typeof CreateMemberBody>;

export const UpdateMemberBody = z.object({
  metadata: z
    .object({
      title: z.string().min(1).optional(),
      course: z.string().min(1).optional(),
      image: z
        .string()
        .transform((imgName) => {
          if (imgName.startsWith("/images")) return imgName;

          return `/images/${imgName}`;
        })
        .optional(),
      interest: z.array(z.string()).nullable().default(null).optional(),
      bio: z.string().optional(),
      contact: z
        .array(
          z.object({
            icon: z.string(),
            link: z.string(),
          })
        )
        .nullable()
        .default(null)
        .optional(),
    })
    .optional(),
  content: z.string().optional(),
});

export type UpdateMemberType = z.TypeOf<typeof UpdateMemberBody>;
