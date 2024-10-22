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
import { trackListSchema, trackSchema } from "./schemas/TrackList";
import { TrackListExample, TrackExample } from "./components/examples";

configureOpenApi(app);
const routes = [];

const TrackListRoute = createRoute({
  method: "get",
  path: "playlist?playlist_id={id}",

  responses: {
    200: {
      content: {
        "application/json": {
          schema: trackListSchema,
        },
      },
      description: "Returns an error",
    },
  },
});

const AuthRoute = createRoute({
  method: "get",
  path: "auth",

  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.string(),
        },
      },
      description: "Returns an error",
    },
  },
});

const TrackRoute = createRoute({
  method: "get",
  path: "track?track_id={track_id}",

  responses: {
    200: {
      content: {
        "application/json": {
          schema: trackSchema,
        },
      },
      description: "Returns an error",
    },
  },
});



app.openapi(
  AuthRoute,
  (c) => {
    return c.text('Auth Succefully', 200);
  }

  // Hook
);

app.openapi(
  TrackRoute,
  (c) => {
    return c.json(TrackExample, 200);
  }

  // Hook
);

app.openapi(
  TrackListRoute,
  (c) => {
    return c.json(TrackListExample, 200);
  }

  // Hook
);

app.get(
  "/reference",
  apiReference({
    spec: {
      url: "/doc",
    },
  })
);

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
