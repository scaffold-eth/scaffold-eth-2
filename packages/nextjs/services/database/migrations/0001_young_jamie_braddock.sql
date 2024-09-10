ALTER TABLE "submissions" ADD COLUMN "eligible" boolean;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "eligible_timestamp" timestamp;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "eligible_admin" varchar(256);