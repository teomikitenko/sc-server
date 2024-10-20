import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "http://example.com",
    allowHeaders: ["X-token", "X-track-id", "X-refresh-token", "X-playlist-id"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    maxAge: 600,
    credentials: true,
  })
);
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/auth", (c) => {
  return c.text("Hello Auth!");
});
app.get("/playlist", (c) => {
  return c.text("Hello playlist!");
});

app.get("/get-track", (c) => {
  return c.text("Hello track!");
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
