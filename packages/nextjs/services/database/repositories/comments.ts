import { InferInsertModel } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { comments } from "~~/services/database/config/schema";

export type CommentInsert = InferInsertModel<typeof comments>;

export async function createComment(comment: CommentInsert) {
  return await db.insert(comments).values(comment);
}
