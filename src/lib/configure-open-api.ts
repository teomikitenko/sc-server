import type { App } from "../../types/types";
import packageJSON from "../../package.json";

export function configureOpenApi(app: App) {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: packageJSON.version,
      title: "My API",
    },
  });
}
