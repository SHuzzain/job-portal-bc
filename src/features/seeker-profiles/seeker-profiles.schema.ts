import { boolean, integer, pgTable, text } from "drizzle-orm/pg-core"
import { user } from "../users/users.schema.ts"
import { timestamps } from "../../lib/columns.ts"

export const seekerProfile = pgTable("seeker_profile", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  displayName: text("display_name"),
  icNumber: text("ic_number"),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  city: text("city"),
  highestEducation: text("highest_education"),
  fieldOfStudy: text("field_of_study"),
  yearsOfExperience: integer("years_of_experience"),
  skills: text("skills"),
  preferredLocation: text("preferred_location"),
  preferredEmploymentType: text("preferred_employment_type"),
  isMalaysian: boolean("is_malaysian").notNull().default(false),
  hasWorkPermit: boolean("has_work_permit").notNull().default(false),
  ...timestamps,
})
