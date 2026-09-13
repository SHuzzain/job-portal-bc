CREATE TABLE "interview" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"interview_date" date NOT NULL,
	"interview_time" text NOT NULL,
	"mode" text NOT NULL,
	"location" text,
	"meeting_link" text,
	"notes" text,
	"status" text DEFAULT 'SCHEDULED' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "interview" ADD CONSTRAINT "interview_application_id_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."application"("id") ON DELETE cascade ON UPDATE no action;