CREATE TABLE "tvet_attendance" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "tvet_attendance_session_user" UNIQUE("session_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "tvet_rfp" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tvet_session" (
	"id" text PRIMARY KEY NOT NULL,
	"rfp_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"title" text NOT NULL,
	"venue" text NOT NULL,
	"starts_at" text NOT NULL,
	"ends_at" text NOT NULL,
	"barcode" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "tvet_session_barcode_unique" UNIQUE("barcode")
);
--> statement-breakpoint
ALTER TABLE "tvet_attendance" ADD CONSTRAINT "tvet_attendance_session_id_tvet_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."tvet_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tvet_attendance" ADD CONSTRAINT "tvet_attendance_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tvet_rfp" ADD CONSTRAINT "tvet_rfp_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tvet_session" ADD CONSTRAINT "tvet_session_rfp_id_tvet_rfp_id_fk" FOREIGN KEY ("rfp_id") REFERENCES "public"."tvet_rfp"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tvet_session" ADD CONSTRAINT "tvet_session_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;