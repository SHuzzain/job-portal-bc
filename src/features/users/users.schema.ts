import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { timestamps } from "../../lib/columns.ts";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  phoneNumber: text("phone_number"),
  role: text("role").default("jobseeker"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires", { withTimezone: true }),
  accountStatus: text("account_status").default("ACTIVE"),
  hasTvetCapability: boolean("has_tvet_capability").default(false),
  activeWorkspace: text("active_workspace").default("employer"),
  ...timestamps,
});
