import { pgTable, text } from "drizzle-orm/pg-core";

import { timestamps } from "../../lib/columns.ts";
import { user } from "../users/users.schema.ts";

export const resume = pgTable("resume", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  fileUrl: text("file_url").notNull(),
  ...timestamps,
});
