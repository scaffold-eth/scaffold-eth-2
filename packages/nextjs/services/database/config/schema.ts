import { relations, sql } from "drizzle-orm";
import { boolean, integer, pgTable, primaryKey, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const builders = pgTable("builders", {
  id: varchar("id", { length: 256 }).primaryKey(),
  github: varchar("github", { length: 256 }),
  telegram: varchar("telegram", { length: 256 }),
  email: varchar("email", { length: 256 }),
  role: varchar("role", { length: 256 }).notNull(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  title: varchar("name", { length: 256 }).notNull(),
  description: text("description").notNull(),
  telegram: varchar("telegram", { length: 256 }),
  linkToRepository: varchar("link_to_repository", { length: 256 }).notNull(),
  linkToVideo: varchar("link_to_video", { length: 256 }).notNull(),
  feedback: text("feedback"),
  submissionTimestamp: timestamp("submission_timestamp")
    .default(sql`now()`)
    .notNull(),
  builder: varchar("builder_id", { length: 256 })
    .references(() => builders.id)
    .notNull(),
  eligible: boolean("eligible"),
  eligibleTimestamp: timestamp("eligible_timestamp"),
  eligibleAdmin: varchar("eligible_admin", { length: 256 }),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  submission: integer("submission_id")
    .references(() => submissions.id)
    .notNull(),
  builder: varchar("builder_id", { length: 256 })
    .references(() => builders.id)
    .notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at")
    .default(sql`now()`)
    .notNull(),
});

export const votes = pgTable(
  "votes",
  {
    submission: integer("submission_id")
      .references(() => submissions.id)
      .notNull(),
    builder: varchar("builder_id", { length: 256 })
      .references(() => builders.id)
      .notNull(),
    score: integer("score").notNull(),
    createdAt: timestamp("created_at")
      .default(sql`now()`)
      .notNull(),
  },
  table => {
    return {
      pk: primaryKey({ columns: [table.submission, table.builder] }),
    };
  },
);

export const submissionsRelations = relations(submissions, ({ many }) => ({
  comments: many(comments),
  votes: many(votes),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  submission: one(submissions, { fields: [comments.submission], references: [submissions.id] }),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  submission: one(submissions, { fields: [votes.submission], references: [submissions.id] }),
  builder: one(builders, { fields: [votes.builder], references: [builders.id] }),
}));
