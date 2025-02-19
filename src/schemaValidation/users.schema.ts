import z from "zod";

export const UserSchema = z.object({
  id: z.string(),
  username: z.string().email(),
  password: z.string().min(8),
});

export type UserType = z.TypeOf<typeof UserSchema>;

export const RegisterBody = z
  .object({
    username: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Confirm Password incorrect",
        path: ["confirmPassword"],
      });
    }
  });

export type RegisterBodyType = z.TypeOf<typeof RegisterBody>;

export const RegisterRes = z.object({
  data: z.object({
    token: z.string(),
    expiresAt: z.date(),
    account: z.object({
      id: z.string(),
      username: z.string().email(),
    }),
  }),
  message: z.string(),
});

export type RegisterResType = z.TypeOf<typeof RegisterRes>;

export const ActivitiesUserSchema = UserSchema.extend({
  editedHistory: z.array(
    z.object({
      time: z.string().datetime(),
      section: z.object({
        part: z.string(),
        id: z.string(),
      }),
    })
  ),
});

export type ActivitiesUserType = z.TypeOf<typeof ActivitiesUserSchema>;

export const LoginBody = z.object({
  username: z.string().email(),
  password: z.string().min(8),
});

export type LoginBodyType = z.TypeOf<typeof LoginBody>;

export const LoginRes = RegisterRes;

export type LoginResType = z.TypeOf<typeof LoginRes>;

export const SlideSessionRes = RegisterRes;

export type SlideSessionResType = z.TypeOf<typeof SlideSessionRes>;
