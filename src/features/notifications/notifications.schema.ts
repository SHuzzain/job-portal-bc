import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { timestamps } from "../../lib/columns.ts";
import { user } from "../users/users.schema.ts";

export const notification = pgTable("notification", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  href: text("href").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  readAt: timestamp("read_at", { withTimezone: true }),
  ...timestamps,
});
