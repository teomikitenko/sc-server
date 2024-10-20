import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { sql } from "@vercel/postgres";
import { env } from "hono/adapter";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

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

const refreshTokenReq = async(clientId:string,clientSecret:string) => {
  const refresh_token = await sql`SELECT refresh_token FROM authdata`

  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  //params.append("refresh_token", refresh_token);
  const refreshTokenReq = await fetch(
    "https://secure.soundcloud.com/oauth/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json; charset=utf-8",
      },
      body: params.toString(),
    }
  );
  await sql`DELETE FROM authdata;`
};

app.get("/auth", async (c) => {
  const { CLIENT_ID, CLIENT_SECRET } = env(c);
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  const auth =
    "Basic " + Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64");

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
  await sql`INSERT INTO authdata (access_token, expires_in, refresh_token, scope, token_type) VALUES (${payload.access_token},
    ${payload.expires_in},
    ${payload.refresh_token},
    ${payload.scope},
    ${payload.token_type});`;
  c.header("Access-Control-Allow-Origin", "*");
  c.status(200);
  return c.text("Auth Succefully");
});

app.get("/playlist", async (c) => {
  const playlist_id = c.req.query("playlist_id");
  const access_token = await sql`SELECT access_token FROM authdata`;

/*   const trackStream = await fetch(
    `https://api.soundcloud.com/playlists?playlist_id=${playlist_id}`,
    {
      method: "GET",
      headers: {
        Authorization: `OAuth ${access_token}`,
        "Cache-control": "no-cache",
        Accept: "application/json; charset=utf-8",
      },
    }
  );
  const payload = await trackStream.json();
  c.status(200);
  c.header("Access-Control-Allow-Origin", "*");
  return c.json(payload); */
  console.log(access_token)
  return c.text('GO')
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
