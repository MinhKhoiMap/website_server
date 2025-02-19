import * as fs from "fs";

import { UserType } from "@/schemaValidation/users.schema";
import { FastifyReply, FastifyRequest } from "fastify";
import { verifySessionToken } from "@/utils/jwt";
import envConfig from "@/../config";

async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  if (request.headers["authorization"]) {
    const sessionToken: string = request.headers["authorization"];

    const decode = verifySessionToken(sessionToken);

    console.log(decode);

    const allUsers: UserType[] = JSON.parse(
      fs.readFileSync(envConfig.USERS_DB).toString()
    );
  }
}
