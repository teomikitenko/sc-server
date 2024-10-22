import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { sql } from "@vercel/postgres";
import { env } from "hono/adapter";
import type { AuthToken } from "../types/types";
import dotenv from "dotenv";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { apiReference } from "@scalar/hono-api-reference";
import app from "./app";
import { configureOpenApi } from "./lib/configure-open-api";
import { configureRoutes } from "./lib/configure-routes";



configureOpenApi(app);
configureRoutes(app);


const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
