import z from "zod";

export const CourseSchema = z.object({
  title: z.string(),
  date: z.date(),
  image: z.string().transform((url) => {
    url = url.startsWith("/") ? url : "/" + url;
    return `http://${process.env.SERVER_HOST_NAME}:${process.env.SERVER_PORT}/${process.env.STATIC_DIR}/static${url}`;
  }),
  duration: z.string(),
  courseStructure: z
    .array(
      z.object({
        years: z.string(),
        image: z.string().transform((url) => {
          url = url.startsWith("/") ? url : "/" + url;
          return `http://${process.env.SERVER_HOST_NAME}:${process.env.SERVER_PORT}/${process.env.STATIC_DIR}/static${url}`;
        }),
      })
    )
    .optional(),
  content: z.string(),
  dualDegree: z.string().optional(),
});

export type CourseType = z.TypeOf<typeof CourseSchema>;

export const CourseCardSchema = z.object({
  title: z.string(),
  draft: z.boolean(),
  image: z.string().transform((url) => {
    url = url.startsWith("/") ? url : "/" + url;
    return `http://${process.env.SERVER_HOST_NAME}:${process.env.SERVER_PORT}/${process.env.STATIC_DIR}/static${url}`;
  }),
  weight: z.number().default(0),
  chance: z.string().optional(),
  id: z.string(),
});

export type CourseCardType = z.TypeOf<typeof CourseCardSchema>;
