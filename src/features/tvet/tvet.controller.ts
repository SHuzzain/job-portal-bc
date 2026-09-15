import * as HttpStatusCodes from "stoker/http-status-codes";

import { authedSession, organizationId } from "../../lib/session.ts";
import type { AppRouteHandler } from "../../lib/types.ts";
import type {
  CreateRfpRoute,
  CreateSessionRoute,
  DownloadCertificateRoute,
  GetCertificateRoute,
  GetSessionRoute,
  ListMyAttendanceRoute,
  ListRfpsRoute,
  ListSessionsRoute,
  ScanRoute,
  SubmitSurveyRoute,
  UpdateRfpRoute,
} from "./tvet.route.ts";
import { TvetError } from "./tvet.service.ts";
import * as tvetService from "./tvet.service.ts";

function mapError(error: unknown) {
  if (error instanceof TvetError) {
    return error;
  }
  throw error;
}

export const listRfps: AppRouteHandler<ListRfpsRoute> = async (c) => {
  return c.json(
    await tvetService.listRfps(organizationId(c)),
    HttpStatusCodes.OK
  );
};

export const createRfp: AppRouteHandler<CreateRfpRoute> = async (c) => {
  try {
    return c.json(
      await tvetService.createRfp(organizationId(c), c.req.valid("json")),
      HttpStatusCodes.CREATED
    );
  } catch (error) {
    const mapped = mapError(error);
    return c.json({ message: mapped.message }, mapped.status);
  }
};

export const updateRfp: AppRouteHandler<UpdateRfpRoute> = async (c) => {
  try {
    const { id } = c.req.valid("param");
    return c.json(
      await tvetService.updateRfp(organizationId(c), id, c.req.valid("json")),
      HttpStatusCodes.OK
    );
  } catch (error) {
    const mapped = mapError(error);
    return c.json({ message: mapped.message }, mapped.status);
  }
};

export const listSessions: AppRouteHandler<ListSessionsRoute> = async (c) => {
  const { rfpId } = c.req.valid("query");
  return c.json(
    await tvetService.listSessions(organizationId(c), rfpId),
    HttpStatusCodes.OK
  );
};

export const createSession: AppRouteHandler<CreateSessionRoute> = async (c) => {
  try {
    return c.json(
      await tvetService.createSession(organizationId(c), c.req.valid("json")),
      HttpStatusCodes.CREATED
    );
  } catch (error) {
    const mapped = mapError(error);
    return c.json({ message: mapped.message }, mapped.status);
  }
};

export const getSession: AppRouteHandler<GetSessionRoute> = async (c) => {
  try {
    const { id } = c.req.valid("param");
    return c.json(
      await tvetService.getSession(organizationId(c), id),
      HttpStatusCodes.OK
    );
  } catch (error) {
    const mapped = mapError(error);
    return c.json({ message: mapped.message }, mapped.status);
  }
};

export const scan: AppRouteHandler<ScanRoute> = async (c) => {
  const session = authedSession(c);

  try {
    return c.json(
      await tvetService.scan(session.user.id, c.req.valid("json").barcode),
      HttpStatusCodes.CREATED
    );
  } catch (error) {
    const mapped = mapError(error);
    return c.json({ message: mapped.message }, mapped.status);
  }
};

export const listMyAttendance: AppRouteHandler<ListMyAttendanceRoute> = async (
  c
) => {
  const session = authedSession(c);
  return c.json(
    await tvetService.listMyAttendance(session.user.id),
    HttpStatusCodes.OK
  );
};

export const submitSurvey: AppRouteHandler<SubmitSurveyRoute> = async (c) => {
  const session = authedSession(c);
  const { id } = c.req.valid("param");

  try {
    return c.json(
      await tvetService.submitSurvey(session.user.id, id, c.req.valid("json")),
      HttpStatusCodes.OK
    );
  } catch (error) {
    const mapped = mapError(error);
    return c.json({ message: mapped.message }, mapped.status);
  }
};

export const getCertificate: AppRouteHandler<GetCertificateRoute> = async (
  c
) => {
  const session = authedSession(c);
  const { id } = c.req.valid("param");

  try {
    return c.json(
      await tvetService.getCertificate(session.user.id, id),
      HttpStatusCodes.OK
    );
  } catch (error) {
    const mapped = mapError(error);
    return c.json({ message: mapped.message }, mapped.status);
  }
};

export const downloadCertificate: AppRouteHandler<
  DownloadCertificateRoute
> = async (c) => {
  const session = authedSession(c);
  const { id } = c.req.valid("param");

  try {
    const pdf = await tvetService.downloadCertificate(session.user.id, id);
    return new Response(Uint8Array.from(pdf).buffer, {
      status: HttpStatusCodes.OK,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="tvet-certificate-${id}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const mapped = mapError(error);
    return c.json({ message: mapped.message }, mapped.status);
  }
};
