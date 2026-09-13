CREATE TABLE "organization_role" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"role" text NOT NULL,
	"permission" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "member" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "status" text DEFAULT 'PENDING_APPROVAL' NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "ssm_number" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "legal_name" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "industry" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "impersonated_by" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'jobseeker';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_expires" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "account_status" text DEFAULT 'ACTIVE';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "has_tvet_capability" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "organization_role" ADD CONSTRAINT "organization_role_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;