import { relations } from "drizzle-orm";

import {
  invitation,
  member,
  organization,
  organizationRole,
  session,
} from "../../auth/schema.ts";
import { application } from "../../features/applications/applications.schema.ts";
import { interview } from "../../features/interviews/interviews.schema.ts";
import { notification } from "../../features/notifications/notifications.schema.ts";
import { resume } from "../../features/resumes/resumes.schema.ts";
import { seekerProfile } from "../../features/seeker-profiles/seeker-profiles.schema.ts";
import {
  tvetAttendance,
  tvetRfp,
  tvetSession,
} from "../../features/tvet/tvet.schema.ts";
import { user } from "../../features/users/users.schema.ts";
import { vacancy } from "../../features/vacancies/vacancies.schema.ts";

export { usersRelations } from "./users.ts";

export const sessionsRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const organizationsRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
  roles: many(organizationRole),
  vacancies: many(vacancy),
  tvetRfps: many(tvetRfp),
  tvetSessions: many(tvetSession),
}));

export const tvetRfpsRelations = relations(tvetRfp, ({ one, many }) => ({
  organization: one(organization, {
    fields: [tvetRfp.organizationId],
    references: [organization.id],
  }),
  sessions: many(tvetSession),
}));

export const tvetSessionsRelations = relations(
  tvetSession,
  ({ one, many }) => ({
    rfp: one(tvetRfp, {
      fields: [tvetSession.rfpId],
      references: [tvetRfp.id],
    }),
    organization: one(organization, {
      fields: [tvetSession.organizationId],
      references: [organization.id],
    }),
    attendance: many(tvetAttendance),
  })
);

export const tvetAttendanceRelations = relations(tvetAttendance, ({ one }) => ({
  session: one(tvetSession, {
    fields: [tvetAttendance.sessionId],
    references: [tvetSession.id],
  }),
  user: one(user, {
    fields: [tvetAttendance.userId],
    references: [user.id],
  }),
}));

export const vacanciesRelations = relations(vacancy, ({ one, many }) => ({
  organization: one(organization, {
    fields: [vacancy.organizationId],
    references: [organization.id],
  }),
  applications: many(application),
}));

export const seekerProfilesRelations = relations(seekerProfile, ({ one }) => ({
  user: one(user, {
    fields: [seekerProfile.userId],
    references: [user.id],
  }),
}));

export const resumesRelations = relations(resume, ({ one, many }) => ({
  user: one(user, {
    fields: [resume.userId],
    references: [user.id],
  }),
  applications: many(application),
}));

export const notificationsRelations = relations(notification, ({ one }) => ({
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
}));

export const applicationsRelations = relations(
  application,
  ({ one, many }) => ({
    user: one(user, {
      fields: [application.userId],
      references: [user.id],
    }),
    vacancy: one(vacancy, {
      fields: [application.vacancyId],
      references: [vacancy.id],
    }),
    resume: one(resume, {
      fields: [application.resumeId],
      references: [resume.id],
    }),
    interviews: many(interview),
  })
);

export const interviewsRelations = relations(interview, ({ one }) => ({
  application: one(application, {
    fields: [interview.applicationId],
    references: [application.id],
  }),
}));

export const organizationRolesRelations = relations(
  organizationRole,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationRole.organizationId],
      references: [organization.id],
    }),
  })
);

export const membersRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export const invitationsRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  inviter: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));
