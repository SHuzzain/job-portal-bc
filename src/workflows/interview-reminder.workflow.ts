import { createHook, sleep } from "workflow";

import * as interviewsService from "../features/interviews/interviews.service.ts";

export type InterviewReminderWorkflowInput = {
  applicationId: string;
  interviewTime: Date;
  candidatePhone: string;
};

export type InterviewReply = {
  response: "confirm" | "decline";
};

export async function interviewReminderWorkflow(
  input: InterviewReminderWorkflowInput
) {
  "use workflow";

  const reminderTime = new Date(
    input.interviewTime.getTime() - 24 * 60 * 60 * 1000
  );
  await sleep(reminderTime);

  const reminderSent = await sendInterviewReminder(input);
  if (!reminderSent) {
    return { status: "interview_not_active" as const };
  }

  using hook = createHook<InterviewReply>({
    token: `interview.reply.${input.applicationId}`,
  });

  const conflict = await hook.getConflict();
  if (conflict) {
    return {
      status: "reply_wait_already_active" as const,
      runId: conflict.runId,
    };
  }

  const result = await Promise.race([
    hook.then((reply) => ({ type: "reply" as const, reply })),
    sleep("12h").then(() => ({ type: "timeout" as const })),
  ]);

  if (result.type === "timeout") {
    return { status: "reply_timeout" as const };
  }

  const updated = await recordInterviewReply(input.applicationId, result.reply);
  return updated
    ? { status: "reply_recorded" as const }
    : { status: "interview_not_active" as const };
}

async function sendInterviewReminder(input: InterviewReminderWorkflowInput) {
  "use step";

  return interviewsService.sendReminder(
    input.applicationId,
    input.interviewTime,
    input.candidatePhone
  );
}

async function recordInterviewReply(
  applicationId: string,
  reply: InterviewReply
) {
  "use step";

  return interviewsService.applyCandidateReply(applicationId, reply.response);
}
