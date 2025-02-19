import * as fs from "fs";
import { addMilliseconds } from "date-fns";
import ms from "ms";

import {
  LoginBodyType,
  LoginResType,
  RegisterBodyType,
  RegisterResType,
  UserType,
} from "@/schemaValidation/users.schema";
import { comparePassword, hashPassword } from "@/utils/crypto";
import { FastifyReply, FastifyRequest } from "fastify";
import generateID from "@/utils/generateUUID";
import envConfig from "@/../config";
import { ErrorResType } from "@/types/error.types";
import { signSessionToken, verifySessionToken } from "@/utils/jwt";

async function registerUser(
  request: FastifyRequest<{ Body: RegisterBodyType }>,
  reply: FastifyReply<{ Reply: { 200: RegisterResType; 500: ErrorResType } }>
): Promise<void> {
  const { body } = request;

  try {
    const hashedPassword = await hashPassword(body.password);
    const id: string = generateID();
    const user = {
      id,
      username: body.username,
      password: hashedPassword,
    };

    const currentUser: UserType[] = JSON.parse(
      fs.readFileSync(envConfig.USERS_DB).toString()
    );

    if (
      currentUser.filter((user) => user.username === body.username).length > 0
    ) {
      throw new Error("Username has already existed");
    }
    currentUser.push(user);

    fs.writeFileSync(envConfig.USERS_DB, JSON.stringify(currentUser));

    const sessionDB: string[] = JSON.parse(
      fs.readFileSync(envConfig.SESSION_DB).toString()
    );

    const sessionToken = signSessionToken({
      userId: id,
    });

    sessionDB.push(sessionToken);

    fs.writeFileSync(envConfig.SESSION_DB, JSON.stringify(sessionDB));

    const expiresAt = addMilliseconds(
      new Date(),
      ms(envConfig.SESSION_TOKEN_EXPIRES_IN)
    );

    reply
      .code(200)
      .setCookie("sessionToken", sessionToken, {
        path: "/",
        httpOnly: true,
        secure: true,
        expires: expiresAt,
        sameSite: "none",
      })
      .send({
        message: "Create new user successfully",
        data: {
          token: sessionToken,
          account: {
            id,
            username: body.username,
          },
          expiresAt: expiresAt,
        },
      });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

async function loginUser(
  request: FastifyRequest<{ Body: LoginBodyType }>,
  reply: FastifyReply<{ Reply: { 200: LoginResType; 500: ErrorResType } }>
): Promise<void> {
  const { username, password } = request.body;

  try {
    const allUser: UserType[] = JSON.parse(
      fs.readFileSync(envConfig.USERS_DB).toString()
    );

    const currentUser: UserType = allUser.filter(
      (user) => user.username === username
    )[0];

    if (!currentUser) {
      throw new Error("User not found");
    }

    const isPasswordCorrect = await comparePassword(
      password,
      currentUser.password
    );

    if (!isPasswordCorrect) {
      throw new Error("Password incorrect");
    }

    const sessionToken = signSessionToken({
      userId: currentUser.id,
    });

    let sessionDB: string[] = JSON.parse(
      fs.readFileSync(envConfig.SESSION_DB).toString()
    );

    sessionDB = sessionDB.filter((session) => {
      const decode = verifySessionToken(session);

      return currentUser.id !== decode.userId;
    });

    sessionDB.push(sessionToken);

    fs.writeFileSync(envConfig.SESSION_DB, JSON.stringify(sessionDB));

    // Should be added logic for delete token which has been still expired and add new one

    const expiresAt = addMilliseconds(
      new Date(),
      ms(envConfig.SESSION_TOKEN_EXPIRES_IN)
    );

    reply
      .code(200)
      .setCookie("sessionToken", sessionToken, {
        path: "/",
        httpOnly: true,
        secure: true,
        expires: expiresAt,
        sameSite: "none",
      })
      .send({
        data: {
          account: {
            id: currentUser.id,
            username: currentUser.username,
          },
          token: sessionToken,
          expiresAt: expiresAt,
        },
        message: "Login successful",
      });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

async function logoutUser(
  request: FastifyRequest,
  reply: FastifyReply<{
    Reply: { 200: { message: string }; 500: ErrorResType };
  }>
) {
  const sessionToken = request.cookies.sessionToken;
  try {
    const sessionDB: string[] = JSON.parse(
      fs.readFileSync(envConfig.SESSION_DB).toString()
    );

    const newSessionDB: string[] = sessionDB.filter(
      (session) => session !== sessionToken
    );

    fs.writeFileSync(envConfig.SESSION_DB, JSON.stringify(newSessionDB));

    reply
      .code(200)
      .clearCookie("sessionToken", {
        path: "/",
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .send({ message: "Logged out successfully" });
  } catch (_e) {
    const e: Error = _e as Error;
    console.error(e);
    reply.code(500).send({
      message: e.message,
    });
  }
}

// async function slideSession(request: FastifyRequest, reply: FastifyReply) {
//   const sessionToken = request.cookies.sessionToken;

//   const expiresAt = addMilliseconds(
//     new Date(),
//     ms(envConfig.SESSION_TOKEN_EXPIRES_IN)
//   );

//   const decode = verifySessionToken(sessionToken)

//   const newToken = signSessionToken({...decode})
// }

export { registerUser, loginUser, logoutUser };
