import z from "zod";

export const PageInfoSchema = z.object({
  description: z.string().default(""),
  bg_image: z
    .string()
    .transform((value) =>
      value ? (value.startsWith("/") ? value : `/${value}`) : ""
    ),
});

export type PageInfoType = z.TypeOf<typeof PageInfoSchema>;
