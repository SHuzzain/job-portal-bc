import { multiSession } from "better-auth/plugins";

export const multiSessionPlugin = multiSession({
  maximumSessions: 5,
});
