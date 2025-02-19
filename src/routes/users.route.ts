import {
  loginUser,
  logoutUser,
  registerUser,
} from "@/controllers/users.controller";
import { requiredLoginedHook } from "@/hooks/auth.hook";
import {
  LoginBodyType,
  LoginResType,
  RegisterBody,
  RegisterBodyType,
  RegisterRes,
  RegisterResType,
} from "@/schemaValidation/users.schema";
import { ErrorResType } from "@/types/error.types";
import { FastifyInstance } from "fastify";

async function usersRoute(server: FastifyInstance) {
  server.post<{
    Reply: { 200: LoginResType; 500: ErrorResType };
    Body: LoginBodyType;
  }>("/login", loginUser);

  server.post<{
    Reply: { 200: RegisterResType; 500: ErrorResType };
    Body: RegisterBodyType;
  }>(
    "/register",
    {
      schema: {
        response: {
          200: RegisterRes,
        },
        body: RegisterBody,
      },
    },
    registerUser
  );

  server.post<{ Reply: { 200: { message: string }; 500: ErrorResType } }>(
    "/logout",
    {
      preValidation: [requiredLoginedHook],
    },
    logoutUser
  );
}

export default usersRoute;
