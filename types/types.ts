import { OpenAPIHono } from "@hono/zod-openapi";
import { Env } from "hono/types";

export type AuthToken = {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    token_type: string;
  };
  export type App = OpenAPIHono<Env, {}, "/">