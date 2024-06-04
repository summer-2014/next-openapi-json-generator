import { getDirectoryItems } from "./core/dir";
import { findAppFolderPath, getRouteExports } from "./core/next";
import { bundlePaths, createRouteRecord } from "./core/route";
import { bundleSchemas } from "./core/schema";
import type { OpenApiDocument } from "@omer-x/openapi-types";
import type { ZodType } from "zod";

export default async function generateOpenApiSpec(schemas: Record<string, ZodType>) {
  const appFolderPath = await findAppFolderPath();
  if (!appFolderPath) throw new Error("This is not a Next.js application!");
  const routes = await getDirectoryItems(appFolderPath, "route.ts");
  const validRoutes = [];
  for (const route of routes) {
    const exportedRouteHandlers = await getRouteExports(route);
    for (const [method, routeHandler] of Object.entries(exportedRouteHandlers)) {
      if (!routeHandler || !routeHandler.apiData) continue;
      validRoutes.push(createRouteRecord(
        method.toLocaleLowerCase(),
        route,
        appFolderPath,
        routeHandler.apiData,
      ));
    }
  }
  return {
    openapi: "3.1.0",
    info: {
      title: "XXXX XXXXX",
      version: "X.X.X",
    },
    paths: bundlePaths(validRoutes),
    components: {
      schemas: bundleSchemas(schemas),
    },
    tags: [],
  } as OpenApiDocument;
}