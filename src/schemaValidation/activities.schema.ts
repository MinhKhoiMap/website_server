import z from "zod";

export const ActivitiesSchema = z
  .object({
    title: z.string(),
    image: z.string().transform((url) => {
      url = url.startsWith("/") ? url : "/" + url;
      return `http://${process.env.SERVER_HOST_NAME}:${process.env.SERVER_PORT}/${process.env.STATIC_DIR}/static${url}`;
    }),
    flipbook: z.boolean(),
    flipbook_page: z
      .array(
        z.object({
          flipbook_page_front: z.string().transform((url) => {
            url = url.startsWith("/") ? url : "/" + url;
            return `http://${process.env.SERVER_HOST_NAME}:${process.env.SERVER_PORT}/${process.env.STATIC_DIR}/static${url}`;
          }),
          flipbook_page_back: z.string().transform((url) => {
            url = url.startsWith("/") ? url : "/" + url;
            return `http://${process.env.SERVER_HOST_NAME}:${process.env.SERVER_PORT}/${process.env.STATIC_DIR}/static${url}`;
          }),
        })
      )
      .optional(),
    flipbook_width: z.number().optional(),
    flipbook_height: z.number().optional(),
    content: z.string().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.flipbook) {
      if (!data.flipbook_page || data.flipbook_page.length < 0) {
        ctx.addIssue({
          path: ["flipbook_page"],
          message: "flipbook_page is required when flipbook is true",
          code: z.ZodIssueCode.invalid_type,
          expected: "array",
          received: "undefined",
        });
      }
    }
  });

export type ActivitiesType = z.TypeOf<typeof ActivitiesSchema>;

export const ActivitiesCardSchema = z.object({
  title: z.string(),
  image: z.string().transform((url) => {
    url = url.startsWith("/") ? url : "/" + url;
    return `http://${process.env.SERVER_HOST_NAME}:${process.env.SERVER_PORT}/${process.env.STATIC_DIR}/static${url}`;
  }),
  draft: z.boolean().default(false),
  weight: z.number().nullable(),
  id: z.string(),
});

export type ActivitiesCardType = z.TypeOf<typeof ActivitiesCardSchema>;
