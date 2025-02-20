import path from "path";
import cors from "@fastify/cors";
import fastify, { FastifyInstance, FastifyReply } from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import fastifyMultipart from "@fastify/multipart";

import aboutRoute from "./routes/about.route";
import newsRoute from "./routes/news.route";
import eventRoute from "./routes/event.route";
import memberRoute from "./routes/member.route";
import partnerRoute from "./routes/partner.route";
import researchRoute from "./routes/research.route";
import competitionRoute from "./routes/competition.route";
import activitiesRoute from "./routes/activities.route";
import courseRoute from "./routes/course.route";
import usersRoute from "./routes/users.route";
import validatorCompilerPlugin from "./plugins/validatorCompiler.plugin";
import envConfig from "../config";
import uploadImageRoute from "./routes/upload.route";
import portalRoute from "./routes/portal.route";
import studiolabRoute from "./routes/studiolab.route";

async function main(server: FastifyInstance) {
  console.log(__dirname);

  const whitelist = ["*"];

  // // Plugins
  server.register(cors, {
    origin: whitelist,
    credentials: true,
  });

  server.register((await import("@fastify/static")).default, {
    root: path.join(path.dirname(__dirname), "static"),
    prefix: "/static/",
    constraints: {
      host: envConfig.SERVER_HOST_NAME,
    },
  });

  server.register(validatorCompilerPlugin);

  server.register(fastifyCookie);
  server.register(fastifySession, { secret: envConfig.SESSION_TOKEN_SECRET });

  server.register(fastifyMultipart, {
    limits: {
      fileSize: 2e7,
      files: Infinity,
    },
  });

  // Routes
  server.get("/", (_, reply: FastifyReply) => {
    reply.code(200).send("Hello, world!");
  });
  server.register(aboutRoute, { prefix: "api/about" });
  server.register(newsRoute, { prefix: "api/news" });
  server.register(eventRoute, { prefix: "api/event" });
  server.register(memberRoute, { prefix: "api/people" });
  server.register(partnerRoute, { prefix: "api/partner" });
  server.register(researchRoute, { prefix: "api/research" });
  server.register(competitionRoute, { prefix: "api/competition" });
  server.register(activitiesRoute, { prefix: "api/activities" });
  server.register(courseRoute, { prefix: "api/course" });
  server.register(usersRoute, { prefix: "api/users" });
  server.register(uploadImageRoute, { prefix: "api/upload" });
  server.register(studiolabRoute, { prefix: "api/studiolab" });
  server.register(portalRoute, { prefix: "api/portal" });

  // try {
  //   await server.listen({
  //     port: Number(process.env.SERVER_PORT),
  //     host: "0.0.0.0",
  //   });
  //   console.log(`Server ready at ${process.env.SERVER_PORT}`);
  // } catch (e) {
  //   console.error(e);
  //   process.exit(1);
  // }
}

export default main;
