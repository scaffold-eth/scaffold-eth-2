CREATE TABLE IF NOT EXISTS "users" (
  "id" serial PRIMARY KEY NOT NULL,
  "address" varchar(42) NOT NULL,
  "username" varchar(255),
  "email" varchar(255),
  "bio" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "users_address_unique" UNIQUE("address")
);
