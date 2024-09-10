import { InferInsertModel, and, eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { votes } from "~~/services/database/config/schema";

export type VoteInsert = InferInsertModel<typeof votes>;

export async function getVote(builderId: string, submissionId: number) {
  return await db.query.votes.findFirst({
    where: and(eq(votes.builder, builderId), eq(votes.submission, submissionId)),
  });
}

export async function createOrUpdateVote(vote: VoteInsert) {
  const currentVote = await getVote(vote.builder, vote.submission);
  if (currentVote) {
    return await db
      .update(votes)
      .set({ score: vote.score })
      .where(and(eq(votes.builder, vote.builder), eq(votes.submission, vote.submission)));
  } else {
    return await db.insert(votes).values(vote);
  }
}

export async function deleteVote(builderId: string, submissionId: number) {
  return await db.delete(votes).where(and(eq(votes.builder, builderId), eq(votes.submission, submissionId)));
}
