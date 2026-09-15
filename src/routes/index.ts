import applications from "../features/applications/applications.route.ts";
import companies from "../features/companies/companies.route.ts";
import interviews from "../features/interviews/interviews.route.ts";
import notifications from "../features/notifications/notifications.route.ts";
import pasak from "../features/pasak/pasak.route.ts";
import platformRoles from "../features/platform-roles/platform-roles.route.ts";
import platformUsers from "../features/platform-users/platform-users.route.ts";
import resumes from "../features/resumes/resumes.route.ts";
import seekerProfiles from "../features/seeker-profiles/seeker-profiles.route.ts";
import {
  pasakClaims,
  providerClaims,
} from "../features/tvet-claims/tvet-claims.route.ts";
import tvet from "../features/tvet/tvet.route.ts";
import users from "../features/users/users.route.ts";
import vacancies from "../features/vacancies/vacancies.route.ts";
import interviewReplyWebhooks from "../features/workflows/interview-reply.route.ts";
import workflows from "../features/workflows/workflows.route.ts";
import { createRouter } from "../lib/create-app.ts";

const routes = createRouter()
  .route("/users", users)
  .route("/companies", companies)
  .route("/vacancies", vacancies)
  .route("/pasak", pasak)
  .route("/pasak", pasakClaims)
  .route("/platform", platformRoles)
  .route("/platform", platformUsers)
  .route("/seeker-profiles", seekerProfiles)
  .route("/resumes", resumes)
  .route("/applications", applications)
  .route("/interviews", interviews)
  .route("/tvet", tvet)
  .route("/tvet", providerClaims)
  .route("/notifications", notifications)
  .route("/workflows", workflows)
  .route("/api/webhooks", interviewReplyWebhooks);

export default routes;
