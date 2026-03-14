// This file enables type checking and editor autocomplete for this Ponder project.
// After upgrading, you may find that changes have been made to this file.
// If this happens, please commit the changes. Do not manually edit this file.
// See https://ponder.sh/docs/getting-started/installation#ponder-envdts for more information.

/// <reference types="ponder/virtual" />

declare module "ponder:registry" {
  import type { Virtual } from "ponder";

  type config = typeof import("./ponder.config").default;
  type schema = typeof import("./ponder.schema");

  export const ponder: Virtual.Registry<config, schema>;

  export type EventNames = Virtual.EventNames<config>;
  export type Event<name extends EventNames = EventNames> = Virtual.Event<
    config,
    name
  >;
  export type Context<name extends EventNames = EventNames> = Virtual.Context<
    config,
    schema,
    name
  >;
  export type IndexingFunctionArgs<name extends EventNames = EventNames> =
    Virtual.IndexingFunctionArgs<config, schema, name>;
}

declare module "ponder:schema" {
  import type { Virtual } from "ponder";

  type schema = typeof import("./ponder.schema");

  export const onchainTable: Virtual.onchainTable;
  const _schema: Virtual.Schema<schema>;
  export default _schema;
  export type { _schema as Schema };

  type resolved = Virtual.ResolvedSchema<schema>;
  export type { resolved as ResolvedSchema };
}

declare module "ponder:api" {
  import type { Virtual } from "ponder";

  type schema = typeof import("./ponder.schema");

  export const db: Virtual.Drizzle<schema>;
}
