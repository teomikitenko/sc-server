import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { sql } from "@vercel/postgres";
import { env } from 'hono/adapter'


import type { AuthToken } from "../types/types";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["POST", "GET", "OPTIONS"],
    maxAge: 600,
    credentials: true,
  })
);
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/auth", async (c) => {
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  const auth =
    "Basic " +
    Buffer.from(
      process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
    ).toString("base64");

  const authDataReq = await fetch("https://secure.soundcloud.com/oauth/token", {
    method: "POST",
    body: params.toString(),
    headers: {
      "Cache-control": "no-cache",
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json; charset=utf-8",
      Authorization: auth,
    },
  });
  const payload: AuthToken = await authDataReq.json();
  await sql`INSERT INTO authdata (access_token, expires_in, refresh_token, scope, token_type) VALUES (${
    (payload.access_token,
    payload.expires_in,
    payload.refresh_token,
    payload.scope,
    payload.token_type)
  });`;
  c.header("Access-Control-Allow-Origin", "*");
  c.status(200);
  return c.text('Auth Succefully');
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
