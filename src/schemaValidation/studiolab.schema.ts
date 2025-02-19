import z from "zod";

export const CollaborationStudioCard = z.object({
  id: z.string(),
  title: z.string(),
  image: z.string().transform((url) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    url = url.startsWith("/") ? url : "/" + url;
    return `http://${process.env.SERVER_HOST_NAME}:${process.env.SERVER_PORT}/${process.env.STATIC_DIR}/static${url}`;
  }),
  date: z.string(),
  location: z.string(),
});

export type CollaborationStudioCardType = z.TypeOf<
  typeof CollaborationStudioCard
>;

export const CollaborationStudioProject = z.object({
  title: z.string(),
  image: z.string().transform((url) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    url = url.startsWith("/") ? url : "/" + url;
    return `http://${process.env.SERVER_HOST_NAME}:${process.env.SERVER_PORT}/${process.env.STATIC_DIR}/static${url}`;
  }),
  members: z.string().array(),
  description: z.string(),
  supervisor: z.string().array(),
  date: z.string(),
  location: z.string(),
  galley: z
    .string()
    .transform((url) => {
      if (!url.startsWith("/")) {
        url = "/" + url;
      }
      return `http://${process.env.SERVER_HOST_NAME}:${process.env.SERVER_PORT}${url}`;
    })
    .array(),
});

export type CollaborationStudioProjectType = z.TypeOf<
  typeof CollaborationStudioProject
>;
