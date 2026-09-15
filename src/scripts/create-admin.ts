import { eq } from "drizzle-orm";

import { platformRoles } from "../auth/access/admin.ts";
import { auth } from "../auth/index.ts";
import { db } from "../db/index.ts";
import { user } from "../db/schema.ts";

const [emailArg, passwordArg, ...nameParts] = process.argv.slice(2);

const email = emailArg ?? process.env.ADMIN_EMAIL;
const password = passwordArg ?? process.env.ADMIN_PASSWORD;
const name = nameParts.join(" ") || process.env.ADMIN_NAME || "Platform Admin";
const role = process.env.ADMIN_ROLE ?? "super_admin";

if (!email || !password) {
  console.error(
    "Usage: pnpm db:create-admin <email> <password> [name]\n" +
      "Or set ADMIN_EMAIL / ADMIN_PASSWORD (optional ADMIN_NAME, ADMIN_ROLE)."
  );
  process.exit(1);
}

if (!(role in platformRoles)) {
  console.error(
    `Invalid ADMIN_ROLE "${role}". Expected one of: ${Object.keys(platformRoles).join(", ")}`
  );
  process.exit(1);
}

if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const [existing] = await db
  .select()
  .from(user)
  .where(eq(user.email, email))
  .limit(1);

if (existing) {
  console.log(`User ${email} already exists, updating role only.`);
} else {
  await auth.api.signUpEmail({ body: { name, email, password } });
  console.log(`Created user ${email}.`);
}

const [updated] = await db
  .update(user)
  .set({ role, emailVerified: true })
  .where(eq(user.email, email))
  .returning({ id: user.id, email: user.email, role: user.role });

console.log(`Role set: ${updated.email} -> ${updated.role} (id ${updated.id})`);
process.exit(0);
