"use strict";

import * as dotenv from "dotenv";
dotenv.config();

// Require the framework
import Fastify from "fastify";

// Instantiate Fastify with some config
const app = Fastify({
  logger: true,
});

console.log("first")

// Register your application as a normal plugin.
app.register(import("../dist/src/app.js"));

export default async (req, res) => {
  console.log("first")
  await app.ready();
  app.server.emit("request", req, res);
};
