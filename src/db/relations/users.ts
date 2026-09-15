import { relations } from "drizzle-orm";

import { account, invitation, member, session } from "../../auth/schema.ts";
import { application } from "../../features/applications/applications.schema.ts";
import { notification } from "../../features/notifications/notifications.schema.ts";
import { resume } from "../../features/resumes/resumes.schema.ts";
import { seekerProfile } from "../../features/seeker-profiles/seeker-profiles.schema.ts";
import { tvetAttendance } from "../../features/tvet/tvet.schema.ts";
import { user } from "../../features/users/users.schema.ts";

export const usersRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  members: many(member),
  invitations: many(invitation),
  seekerProfile: one(seekerProfile),
  resumes: many(resume),
  applications: many(application),
  notifications: many(notification),
  tvetAttendance: many(tvetAttendance),
}));
