import * as HttpStatusCodes from "stoker/http-status-codes"
import { start } from "workflow/api"
import { organizationId } from "../../lib/session.ts"
import type { AppRouteHandler } from "../../lib/types.ts"
import { interviewReminderWorkflow } from "../../workflows/interview-reminder.workflow.ts"
import type { ScheduleInterviewRoute } from "./interviews.route.ts"
import { InterviewError } from "./interviews.service.ts"
import * as interviewsService from "./interviews.service.ts"

export const scheduleInterview: AppRouteHandler<ScheduleInterviewRoute> = async (c) => {
  try {
    const interview = await interviewsService.scheduleInterview(
      organizationId(c),
      c.req.valid("json"),
    )
    const candidatePhone = await interviewsService.candidatePhoneForApplication(
      interview.applicationId,
    )
    await start(interviewReminderWorkflow, [
      {
        applicationId: interview.applicationId,
        interviewTime: interviewsService.interviewDateTime(
          interview.interviewDate,
          interview.interviewTime,
        ),
        candidatePhone,
      },
    ])
    return c.json(interview, HttpStatusCodes.CREATED)
  } catch (error) {
    if (error instanceof InterviewError) {
      return c.json({ message: error.message }, error.status)
    }
    throw error
  }
}
