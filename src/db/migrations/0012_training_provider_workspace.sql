ALTER TABLE "user" ADD COLUMN "active_workspace" text DEFAULT 'employer';
--> statement-breakpoint
UPDATE "platform_role"
SET
	"permissions" = '{"company":["view","create","update","resubmit"],"vacancy":["view","create","update","delete","resubmit"],"applicant":["view","shortlist","reject","hire","follow_up"],"interview":["view","schedule"],"org_member":["view","invite","update_role","remove"],"org_role":["view","create","update","delete"],"notification":["view","mark_read"]}'::jsonb,
	"updated_at" = now()
WHERE "name" = 'employer';
--> statement-breakpoint
INSERT INTO "platform_role" ("id", "name", "label", "permissions", "is_system", "created_at", "updated_at")
VALUES (
	gen_random_uuid()::text,
	'training_provider',
	'Training Provider',
	'{"company":["view","update"],"tvet_rfp":["view","create","update","close"],"tvet_session":["view","create"],"tvet_claim":["view","create","upload_signed","download"],"notification":["view","mark_read"]}'::jsonb,
	true,
	now(),
	now()
);
