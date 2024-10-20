import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "http://example.com",
    allowHeaders: ["X-token", "X-track-id", "X-refresh-token", "X-playlist-id"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 600,
    credentials: true,
  })
);

app.get("/auth", (c) => {
  return c.text("Hello Hono!");
});
app.get("playlist", (c) => {
  return c.text("Hello playlist!");
});

app.get("get-track", (c) => {
  return c.text("Hello track!");
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const OPTIONS = handler;
