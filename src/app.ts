import { cors } from "hono/cors";
import { sql } from "@vercel/postgres";
import { env } from "hono/adapter";
import type { AuthToken } from "../types/types";
import dotenv from "dotenv";
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import configureOpenApi from "@/lib/configure-open-api";
import configureRoutes from "@/lib/configure-routes";

dotenv.config({ path: ".env" });


const app = new OpenAPIHono();


configureOpenApi(app);
configureRoutes(app);



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
  return c.text("Sc-server is working");
});

const refreshTokenReq = async (clientId: string, clientSecret: string) => {
  const refresh_object = await sql`SELECT refresh_token FROM authdata`;
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("refresh_token", refresh_object.rows[0].refresh_token as string);

  const refreshResult = await fetch(
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
  await sql`DELETE FROM authdata;`;
  const payload: AuthToken = await refreshResult.json();
  await sql`INSERT INTO authdata (access_token, expires_in, refresh_token, scope, token_type) VALUES (${payload.access_token},
    ${payload.expires_in},
    ${payload.refresh_token},
    ${payload.scope},
    ${payload.token_type});`;
};
const getPlaylist = async (playlistId: string) => {
  const access_object = await sql`SELECT access_token FROM authdata`;
  const trackStream = await fetch(
    `https://api.soundcloud.com/playlists/${playlistId}`,
    {
      method: "GET",
      headers: {
        Authorization: `OAuth ${access_object.rows[0].access_token}`,
        "Cache-control": "no-cache",
        Accept: "application/json; charset=utf-8",
      },
    }
  );
  return trackStream;
};
const getTrack = async (trackId: string) => {
  const access_object = await sql`SELECT access_token FROM authdata`;
  const trackStreamUrl = await fetch(
    `https://api.soundcloud.com/tracks/${trackId}/streams`,
    {
      method: "GET",
      headers: {
        Authorization: `OAuth ${access_object.rows[0].access_token}`,
        "Cache-control": "no-cache",
        Accept: "application/json; charset=utf-8",
      },
    }
  );
  return trackStreamUrl;
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
  await sql`DELETE FROM authdata;`;
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
  const { CLIENT_ID, CLIENT_SECRET } = env(c);
  const playlist_id = c.req.query("playlist_id");

  const stream = await getPlaylist(playlist_id!);
   if (stream.status === 401) {
    await refreshTokenReq(CLIENT_ID as string, CLIENT_SECRET as string);
    const res = await getPlaylist(playlist_id!);

    const payload = await res.json();
    c.status(200);
    c.header("Access-Control-Allow-Origin", "*");
    return c.json(payload);
  }
  if (stream.status === 200) {
    const payload = await stream.json();
    c.status(200);
    c.header("Access-Control-Allow-Origin", "*");
    return c.json(payload);
  }  
  const payload = await stream.json();
    c.status(200);
    c.header("Access-Control-Allow-Origin", "*");
    return c.json(payload);
});

app.get("/track", async (c) => {
  const { CLIENT_ID, CLIENT_SECRET } = env(c);
  const track_id = c.req.query("track_id");
  const currentTrack = await getTrack(track_id!);
  if (currentTrack.status === 401) {
    await refreshTokenReq(CLIENT_ID as string, CLIENT_SECRET as string);
    const res = await getTrack(track_id!);
    const payload = await res.json();
    c.status(200);
    c.header("Access-Control-Allow-Origin", "*");
    return c.json(payload);
  }
  if (currentTrack.status === 200) {
    c.status(200);
    c.header("Access-Control-Allow-Origin", "*");
    const payload = await currentTrack.json();
    return c.json(payload);
  }
});
export default app