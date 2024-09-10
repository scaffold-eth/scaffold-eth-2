import { InferInsertModel, InferSelectModel, desc, eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { comments, submissions, votes } from "~~/services/database/config/schema";

export type SubmissionInsert = InferInsertModel<typeof submissions>;
type Comment = InferInsertModel<typeof comments>;
type Vote = InferInsertModel<typeof votes>;
export type Submission = InferSelectModel<typeof submissions> & { comments: Comment[]; votes: Vote[] };

export async function getAllSubmissions() {
  return await db.query.submissions.findMany({
    with: { comments: true, votes: true },
    orderBy: [desc(submissions.id)],
  });
}

export async function createSubmission(submission: SubmissionInsert) {
  return await db.insert(submissions).values(submission);
}

export async function setEligible(submissionId: number, eligible: boolean, builderId: string) {
  return await db
    .update(submissions)
    .set({ eligible, eligibleAdmin: builderId, eligibleTimestamp: new Date() })
    .where(eq(submissions.id, submissionId));
}

export async function clearEligible(submissionId: number) {
  return await db
    .update(submissions)
    .set({ eligible: null, eligibleAdmin: null, eligibleTimestamp: null })
    .where(eq(submissions.id, submissionId));
}
