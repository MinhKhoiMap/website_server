"use strict";

import * as dotenv from "dotenv";
dotenv.config();

// Require the framework
import Fastify from "fastify";
import main from "../dist/src/app";

// Instantiate Fastify with some config
const app = Fastify({
  logger: true,
});

// Register your application as a normal plugin.
app.register(main);

export default async (req, res) => {
  await app.ready();
  app.server.emit("request", req, res);
};
