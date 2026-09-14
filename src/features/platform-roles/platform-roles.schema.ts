import { boolean, jsonb, pgTable, text } from "drizzle-orm/pg-core"
import { timestamps } from "../../lib/columns.ts"

export const platformRole = pgTable("platform_role", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  label: text("label").notNull(),
  permissions: jsonb("permissions").notNull().$type<Record<string, string[]>>(),
  isSystem: boolean("is_system").notNull().default(false),
  ...timestamps,
})
