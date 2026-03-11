// This file enables type checking and editor autocomplete for this Ponder project.
// After upgrading, you may find that changes have been made to this file.
// If this happens, please commit the changes. Do not manually edit this file.
// See https://ponder.sh/docs/getting-started/installation#create-ponder-envdts for more information.

// Ponder virtual module declarations
declare module "ponder:registry" {
  import type { Virtual } from "ponder";

  type config = typeof import("./ponder.config").default;
  type schema = typeof import("./ponder.schema");

  export const ponder: Virtual.Registry<config, schema>;
}

declare module "ponder:schema" {
  import type { Virtual } from "ponder";

  type schema = typeof import("./ponder.schema");

  export = Virtual.Schema<schema>;
}

declare module "ponder:api" {
  import type { Virtual } from "ponder";

  type schema = typeof import("./ponder.schema");

  export const db: Virtual.Drizzle<schema>;
}
