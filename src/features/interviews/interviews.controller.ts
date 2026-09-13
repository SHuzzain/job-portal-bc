import * as HttpStatusCodes from "stoker/http-status-codes"
import { auth } from "../../auth/index.ts"
import type { AppRouteHandler } from "../../lib/types.ts"
import type { ScheduleInterviewRoute } from "./interviews.route.ts"
import { InterviewError } from "./interviews.service.ts"
import * as interviewsService from "./interviews.service.ts"

function activeOrgId(session: unknown) {
  const id = (session as { session?: { activeOrganizationId?: unknown } }).session
    ?.activeOrganizationId
  return typeof id === "string" ? id : null
}

export const scheduleInterview: AppRouteHandler<ScheduleInterviewRoute> = async (c) => {
    const session = c.get("session")
    if (!session) {
      return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED)
    }

    const organizationId = activeOrgId(session)
    if (!organizationId) {
      return c.json({ message: "No active company selected" }, HttpStatusCodes.BAD_REQUEST)
    }

    const permission = await auth.api.hasPermission({
      headers: c.req.raw.headers,
      body: { permissions: { vacancy: ["update"] } },
    })
    if (!permission?.success) {
      return c.json({ message: "Missing vacancy.update permission" }, HttpStatusCodes.FORBIDDEN)
    }

    try {
      const interview = await interviewsService.scheduleInterview(
        organizationId,
        c.req.valid("json"),
      )
      return c.json(interview, HttpStatusCodes.CREATED)
    } catch (error) {
      if (error instanceof InterviewError) {
        return c.json({ message: error.message }, error.status)
      }
      throw error
    }
  }
