import { createRoute, z } from "@hono/zod-openapi";
import { trackListSchema, trackSchema } from "../schemas/TrackList";
import { TrackListExample, TrackExample } from "../components/examples";
import { apiReference } from "@scalar/hono-api-reference";
import type { App } from "../../types/types";

function configureRoutes(app: App) {
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
      return c.text("Auth Succefully", 200);
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
}

export default configureRoutes
