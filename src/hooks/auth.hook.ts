import fs from "fs";
import envConfig from "@/../config";
import { FastifyRequest } from "fastify";
import { verifySessionToken } from "@/utils/jwt";
import { UserType } from "@/schemaValidation/users.schema";

async function requiredLoginedHook(request: FastifyRequest) {
  const sessionToken: string = request.headers["authorization"] || "";

  if (!sessionToken) throw new Error("Session token is required");

  const sessionDB: string[] = JSON.parse(
    fs.readFileSync(envConfig.SESSION_DB).toString()
  );

  const session = sessionDB.filter((session) => session === sessionToken);

  if (!session.length) throw new Error("Session not found");

  const decode = verifySessionToken(sessionToken);

  const allUsers: UserType[] = JSON.parse(
    fs.readFileSync(envConfig.USERS_DB).toString()
  );

  const user = allUsers.filter((user) => user.id === decode.userId)[0];

  request.user = user;
}

async function checkIsLogined(request: FastifyRequest) {
  const sessionToken: string = request.headers.authorization || "";

  const sessionDB: string[] = JSON.parse(
    fs.readFileSync(envConfig.SESSION_DB).toString()
  );

  const session = sessionDB.filter((session) => session === sessionToken);

  if (session.length) {
    const decode = verifySessionToken(sessionToken);

    const allUsers: UserType[] = JSON.parse(
      fs.readFileSync(envConfig.USERS_DB).toString()
    );

    const user = allUsers.filter((user) => user.id === decode.userId)[0];

    request.user = user;
  }
  // console.log(request.headers.cookie, "auth hook | cookie");
}

export { requiredLoginedHook, checkIsLogined };
