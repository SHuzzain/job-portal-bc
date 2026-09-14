ALTER TABLE "tvet_attendance" ADD COLUMN "attendance_recorded_at" timestamp with time zone;--> statement-breakpoint
UPDATE "tvet_attendance" SET "attendance_recorded_at" = "created_at";--> statement-breakpoint
ALTER TABLE "tvet_attendance" ALTER COLUMN "attendance_recorded_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tvet_attendance" ALTER COLUMN "attendance_recorded_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tvet_attendance" ADD COLUMN "survey_completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tvet_attendance" ADD COLUMN "certificate_code" text;--> statement-breakpoint
ALTER TABLE "tvet_attendance" ADD COLUMN "survey_rating" integer;--> statement-breakpoint
ALTER TABLE "tvet_attendance" ADD COLUMN "survey_feedback" text;--> statement-breakpoint
ALTER TABLE "tvet_attendance" ADD CONSTRAINT "tvet_attendance_certificate_code" UNIQUE("certificate_code");