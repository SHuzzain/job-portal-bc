import { sleep } from "workflow"
import * as applicationsService from "../features/applications/applications.service.ts"

export type StaleApplicationWorkflowInput = {
  applicationId: string
}

export async function staleApplicationWorkflow(input: StaleApplicationWorkflowInput) {
  "use workflow"

  await sleep("90 days")
  return failApplicationIfStillStale(input.applicationId)
}

async function failApplicationIfStillStale(applicationId: string) {
  "use step"

  return applicationsService.failIfStillAwaitingReview(applicationId)
}
