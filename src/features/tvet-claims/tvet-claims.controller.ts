import * as HttpStatusCodes from "stoker/http-status-codes";
import { organizationId } from "../../lib/session.ts";
import type { AppRouteHandler } from "../../lib/types.ts";
import type {
  DownloadBorangAkuanRoute,
  DownloadPaymentVoucherRoute,
  FinalizeClaimRoute,
  ListEligibleCoursesRoute,
  ListPasakClaimsRoute,
  ListProviderClaimsRoute,
  ReviewClaimRoute,
  SubmitClaimRoute,
  UploadSignedClaimRoute,
} from "./tvet-claims.route.ts";
import { TvetClaimError } from "./tvet-claims.service.ts";
import * as service from "./tvet-claims.service.ts";

function mapped(error: unknown) {
  if (error instanceof TvetClaimError) return error;
  throw error;
}

export const listEligibleCourses: AppRouteHandler<
  ListEligibleCoursesRoute
> = async (c) =>
  c.json(
    await service.listEligibleCourses(organizationId(c)),
    HttpStatusCodes.OK,
  );

export const listProviderClaims: AppRouteHandler<
  ListProviderClaimsRoute
> = async (c) =>
  c.json(
    await service.listProviderClaims(organizationId(c)),
    HttpStatusCodes.OK,
  );

export const submitClaim: AppRouteHandler<SubmitClaimRoute> = async (c) => {
  try {
    return c.json(
      await service.submitClaim(organizationId(c), c.req.valid("json")),
      HttpStatusCodes.CREATED,
    );
  } catch (error) {
    const value = mapped(error);
    return c.json({ message: value.message }, value.status);
  }
};

export const uploadSignedClaim: AppRouteHandler<
  UploadSignedClaimRoute
> = async (c) => {
  try {
    const { id } = c.req.valid("param");
    const { signedBorangAkuanUrl } = c.req.valid("json");
    return c.json(
      await service.uploadSigned(organizationId(c), id, signedBorangAkuanUrl),
      HttpStatusCodes.OK,
    );
  } catch (error) {
    const value = mapped(error);
    return c.json({ message: value.message }, value.status);
  }
};

export const listPasakClaims: AppRouteHandler<ListPasakClaimsRoute> = async (
  c,
) => c.json(await service.listPasakClaims(), HttpStatusCodes.OK);

export const reviewClaim: AppRouteHandler<ReviewClaimRoute> = async (c) => {
  try {
    const { id } = c.req.valid("param");
    const { action, comments } = c.req.valid("json");
    return c.json(
      await service.reviewClaim(id, action, comments),
      HttpStatusCodes.OK,
    );
  } catch (error) {
    const value = mapped(error);
    return c.json({ message: value.message }, value.status);
  }
};

export const finalizeClaim: AppRouteHandler<FinalizeClaimRoute> = async (c) => {
  try {
    const { id } = c.req.valid("param");
    return c.json(await service.finalizePayment(id), HttpStatusCodes.OK);
  } catch (error) {
    const value = mapped(error);
    return c.json({ message: value.message }, value.status);
  }
};

async function pdfResponse(
  id: string,
  employerId: string,
  kind: "PAYMENT_VOUCHER" | "BORANG_AKUAN",
) {
  const pdf = await service.downloadDocument(id, kind, employerId);
  const filename =
    kind === "PAYMENT_VOUCHER"
      ? `payment-voucher-${id}.pdf`
      : `borang-akuan-terima-${id}.pdf`;
  return new Response(Uint8Array.from(pdf).buffer, {
    status: HttpStatusCodes.OK,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

export const downloadPaymentVoucher: AppRouteHandler<
  DownloadPaymentVoucherRoute
> = async (c) => {
  try {
    return await pdfResponse(
      c.req.valid("param").id,
      organizationId(c),
      "PAYMENT_VOUCHER",
    );
  } catch (error) {
    const value = mapped(error);
    return c.json({ message: value.message }, value.status);
  }
};

export const downloadBorangAkuan: AppRouteHandler<
  DownloadBorangAkuanRoute
> = async (c) => {
  try {
    return await pdfResponse(
      c.req.valid("param").id,
      organizationId(c),
      "BORANG_AKUAN",
    );
  } catch (error) {
    const value = mapped(error);
    return c.json({ message: value.message }, value.status);
  }
};
