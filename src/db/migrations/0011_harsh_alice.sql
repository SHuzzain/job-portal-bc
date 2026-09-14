CREATE TABLE "platform_role" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"label" text NOT NULL,
	"permissions" jsonb NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "platform_role_name_unique" UNIQUE("name")
);
--> statement-breakpoint
INSERT INTO "platform_role" ("id", "name", "label", "permissions", "is_system", "created_at", "updated_at") VALUES
	(gen_random_uuid()::text, 'jobseeker', 'Job seeker', '{"seeker_profile":["view","update"],"resume":["view","create","delete"],"seeker_application":["view","create"],"tvet_attendance":["view","scan"],"tvet_certificate":["view","submit_survey","download"],"notification":["view","mark_read"]}'::jsonb, true, now(), now()),
	(gen_random_uuid()::text, 'employer', 'Employer', '{"company":["view","create","update","resubmit"],"vacancy":["view","create","update","delete","resubmit"],"applicant":["view","shortlist","reject","hire","follow_up"],"interview":["view","schedule"],"tvet_rfp":["view","create","update","close"],"tvet_session":["view","create"],"tvet_claim":["view","create","upload_signed","download"],"org_member":["view","invite","update_role","remove"],"org_role":["view","create","update","delete"],"notification":["view","mark_read"]}'::jsonb, true, now(), now()),
	(gen_random_uuid()::text, 'admin', 'PASAK admin', '{"company_review":["view","approve","reject","return"],"vacancy_review":["view","approve","reject","return"],"tvet_capability":["view","grant","revoke"],"claim_review":["view","approve","reject","finalize"],"platform_user":["view","create","update","set_role"],"platform_role":["view"],"notification":["view","mark_read"]}'::jsonb, true, now(), now()),
	(gen_random_uuid()::text, 'super_admin', 'Super admin', '{"seeker_profile":["view","update"],"resume":["view","create","delete"],"seeker_application":["view","create"],"tvet_attendance":["view","scan"],"tvet_certificate":["view","submit_survey","download"],"company":["view","create","update","resubmit"],"vacancy":["view","create","update","delete","resubmit"],"applicant":["view","shortlist","reject","hire","follow_up"],"interview":["view","schedule"],"tvet_rfp":["view","create","update","close"],"tvet_session":["view","create"],"tvet_claim":["view","create","upload_signed","download"],"company_review":["view","approve","reject","return"],"vacancy_review":["view","approve","reject","return"],"tvet_capability":["view","grant","revoke"],"claim_review":["view","approve","reject","finalize"],"platform_user":["view","create","update","set_role"],"platform_role":["view","create","update","delete"],"org_member":["view","invite","update_role","remove"],"org_role":["view","create","update","delete"],"notification":["view","mark_read"]}'::jsonb, true, now(), now());
