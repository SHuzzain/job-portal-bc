import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import {
  requirePasakAdmin,
  requireTvetCompany,
} from "../../auth/middleware.ts";
import { createRouter } from "../../lib/create-app.ts";
import { errorResponses } from "../../lib/http-errors.ts";
import {
  downloadBorangAkuan,
  downloadPaymentVoucher,
  finalizeClaim,
  listEligibleCourses,
  listPasakClaims,
  listProviderClaims,
  reviewClaim,
  submitClaim,
  uploadSignedClaim,
} from "./tvet-claims.controller.ts";
import {
  claimIdParamSchema,
  eligibleCourseSchema,
  reviewClaimBodySchema,
  submitClaimBodySchema,
  tvetClaimSchema,
  uploadSignedClaimBodySchema,
} from "./validator/tvet-claims.schema.ts";

const pdfResponse = {
  description: "Authenticated PDF document",
  content: {
    "application/pdf": {
      schema: z.string().openapi({ format: "binary" }),
    },
  },
};

export const listEligibleCoursesRoute = createRoute({
  method: "get",
  path: "/claims/eligible-courses",
  tags: ["TVET Claims"],
  middleware: [requireTvetCompany],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      eligibleCourseSchema.array(),
      "Completed unclaimed courses",
    ),
    ...errorResponses,
  },
});

export const listProviderClaimsRoute = createRoute({
  method: "get",
  path: "/claims",
  tags: ["TVET Claims"],
  middleware: [requireTvetCompany],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      tvetClaimSchema.array(),
      "Provider claims",
    ),
    ...errorResponses,
  },
});

export const submitClaimRoute = createRoute({
  method: "post",
  path: "/claims",
  tags: ["TVET Claims"],
  middleware: [requireTvetCompany],
  request: {
    body: jsonContentRequired(submitClaimBodySchema, "TVET finance claim"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(tvetClaimSchema, "Submitted claim"),
    ...errorResponses,
  },
});

export const uploadSignedClaimRoute = createRoute({
  method: "post",
  path: "/claims/{id}/upload-signed",
  tags: ["TVET Claims"],
  middleware: [requireTvetCompany],
  request: {
    params: claimIdParamSchema,
    body: jsonContentRequired(
      uploadSignedClaimBodySchema,
      "Signed acknowledgement URL",
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(tvetClaimSchema, "Updated claim"),
    ...errorResponses,
  },
});

export const downloadPaymentVoucherRoute = createRoute({
  method: "get",
  path: "/claims/{id}/payment-voucher",
  tags: ["TVET Claims"],
  middleware: [requireTvetCompany],
  request: { params: claimIdParamSchema },
  responses: { [HttpStatusCodes.OK]: pdfResponse, ...errorResponses },
});

export const downloadBorangAkuanRoute = createRoute({
  method: "get",
  path: "/claims/{id}/borang-akuan",
  tags: ["TVET Claims"],
  middleware: [requireTvetCompany],
  request: { params: claimIdParamSchema },
  responses: { [HttpStatusCodes.OK]: pdfResponse, ...errorResponses },
});

export const listPasakClaimsRoute = createRoute({
  method: "get",
  path: "/claims",
  tags: ["PASAK TVET Claims"],
  middleware: [requirePasakAdmin],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      tvetClaimSchema.array(),
      "All TVET claims",
    ),
    ...errorResponses,
  },
});

export const reviewClaimRoute = createRoute({
  method: "post",
  path: "/claims/{id}/review",
  tags: ["PASAK TVET Claims"],
  middleware: [requirePasakAdmin],
  request: {
    params: claimIdParamSchema,
    body: jsonContentRequired(reviewClaimBodySchema, "Finance review"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(tvetClaimSchema, "Reviewed claim"),
    ...errorResponses,
  },
});

export const finalizeClaimRoute = createRoute({
  method: "post",
  path: "/claims/{id}/finalize-payment",
  tags: ["PASAK TVET Claims"],
  middleware: [requirePasakAdmin],
  request: { params: claimIdParamSchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(tvetClaimSchema, "Paid claim"),
    ...errorResponses,
  },
});

export type ListEligibleCoursesRoute = typeof listEligibleCoursesRoute;
export type ListProviderClaimsRoute = typeof listProviderClaimsRoute;
export type SubmitClaimRoute = typeof submitClaimRoute;
export type UploadSignedClaimRoute = typeof uploadSignedClaimRoute;
export type DownloadPaymentVoucherRoute = typeof downloadPaymentVoucherRoute;
export type DownloadBorangAkuanRoute = typeof downloadBorangAkuanRoute;
export type ListPasakClaimsRoute = typeof listPasakClaimsRoute;
export type ReviewClaimRoute = typeof reviewClaimRoute;
export type FinalizeClaimRoute = typeof finalizeClaimRoute;

export const providerClaims = createRouter()
  .openapi(listEligibleCoursesRoute, listEligibleCourses)
  .openapi(listProviderClaimsRoute, listProviderClaims)
  .openapi(submitClaimRoute, submitClaim)
  .openapi(uploadSignedClaimRoute, uploadSignedClaim)
  .openapi(downloadPaymentVoucherRoute, downloadPaymentVoucher)
  .openapi(downloadBorangAkuanRoute, downloadBorangAkuan);

export const pasakClaims = createRouter()
  .openapi(listPasakClaimsRoute, listPasakClaims)
  .openapi(reviewClaimRoute, reviewClaim)
  .openapi(finalizeClaimRoute, finalizeClaim);
