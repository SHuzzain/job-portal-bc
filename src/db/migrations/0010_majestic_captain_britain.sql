CREATE TYPE "public"."tvet_claim_status" AS ENUM('SUBMITTED', 'FINANCE_APPROVED', 'SIGNED_DOC_SUBMITTED', 'PAID', 'REJECTED');--> statement-breakpoint
CREATE TABLE "tvet_claims" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"employer_id" text NOT NULL,
	"claim_amount" numeric(12, 2) NOT NULL,
	"borang_tuntutan_url" text NOT NULL,
	"status" "tvet_claim_status" DEFAULT 'SUBMITTED' NOT NULL,
	"signed_borang_akuan_url" text,
	"review_notes" text,
	"reviewed_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "tvet_claims_course_provider" UNIQUE("course_id","employer_id")
);
--> statement-breakpoint
ALTER TABLE "tvet_claims" ADD CONSTRAINT "tvet_claims_course_id_tvet_session_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."tvet_session"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tvet_claims" ADD CONSTRAINT "tvet_claims_employer_id_organization_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;