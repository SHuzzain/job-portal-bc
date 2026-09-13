import { pgTable, text } from "drizzle-orm/pg-core"
import { user } from "../users/users.schema.ts"
import { timestamps } from "../../lib/columns.ts"

export const resume = pgTable("resume", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  fileUrl: text("file_url").notNull(),
  ...timestamps,
})
