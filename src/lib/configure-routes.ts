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
        description: "Get tracklist",
      },
      404: {
        content: {
          "application/json": {
            schema: z.object({
              code: z.number(),
              message: z.string(),
            }),
          },
        },
        description: "Route does not exist",
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
        description: "Get track",
      },
      404: {
        content: {
          "application/json": {
            schema: z.object({
              code: z.number(),
              message: z.string(),
            }),
          },
        },
        description: "Route does not exist",
      },
    },
  });

  app.openapi(
    TrackRoute,
    (c) => {
      return c.json(TrackExample, 200);
    },
    // Hook
    (result, c) => {
      if (!result.success) {
        return c.json(
          {
            code: 404,
            message: "Route does not exist",
          },
          404
        );
      }
    }
  );

  app.openapi(
    TrackListRoute,
    (c) => {
      return c.json(TrackListExample, 200);
    },

    (result, c) => {
      if (!result.success) {
        return c.json(
          {
            code: 404,
            message: "Route does not exist",
          },
          404
        );
      }
    }
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

export default configureRoutes;
