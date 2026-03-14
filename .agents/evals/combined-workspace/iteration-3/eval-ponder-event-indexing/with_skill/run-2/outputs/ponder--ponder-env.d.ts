// This file enables type checking and editor autocomplete for this Ponder project.
// After running `ponder dev` or `ponder start`, you can optionally run `ponder codegen` to
// regenerate this file.
declare module "ponder:registry" {
  import type { Virtual } from "ponder";
  type config = typeof import("./ponder.config").default;
  type schema = typeof import("./ponder.schema");
  export const ponder: Virtual.Registry<config, schema>;
}

declare module "ponder:schema" {
  import type { Virtual } from "ponder";
  type schema = typeof import("./ponder.schema");
  const schema: Virtual.Schema<schema>;
  export = schema;
}

declare module "ponder:api" {
  import type { Virtual } from "ponder";
  type schema = typeof import("./ponder.schema");
  export const db: Virtual.Drizzle<schema>;
}
