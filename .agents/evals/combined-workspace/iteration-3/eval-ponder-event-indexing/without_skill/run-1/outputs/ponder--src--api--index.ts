import { db } from "ponder:api";
import schema from "ponder:schema";
import { Hono } from "hono";
import { graphql } from "ponder";

const app = new Hono();

app.use("/graphql", graphql({ db, schema }));

// Health check endpoint
app.get("/health", (c) => c.json({ status: "ok" }));

export default app;
