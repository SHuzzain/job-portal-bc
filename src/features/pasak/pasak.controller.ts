import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "../../lib/types.ts";
import { VacancyError } from "../vacancies/vacancies.service.ts";
import type {
  ListCompaniesRoute,
  ListEmployersRoute,
  ListVacanciesRoute,
  ReviewCompanyRoute,
  ReviewVacancyRoute,
  SetCompanyStatusRoute,
  SetTvetCapabilityRoute,
  SetVacancyStatusRoute,
} from "./pasak.route.ts";
import { PasakError } from "./pasak.service.ts";
import * as pasakService from "./pasak.service.ts";

function pasakError(error: unknown) {
  if (error instanceof PasakError) {
    return { status: error.status, message: error.message };
  }
  throw error;
}

export const listCompanies: AppRouteHandler<ListCompaniesRoute> = async (c) => {
  const { status } = c.req.valid("query");
  return c.json(await pasakService.listCompanies(status), HttpStatusCodes.OK);
};

export const setCompanyStatus: AppRouteHandler<SetCompanyStatusRoute> = async (
  c
) => {
  try {
    const { id } = c.req.valid("param");
    const { status } = c.req.valid("json");
    return c.json(
      await pasakService.setCompanyStatus(id, status),
      HttpStatusCodes.OK
    );
  } catch (error) {
    const mapped = pasakError(error);
    return c.json({ message: mapped.message }, mapped.status);
  }
};

export const reviewCompany: AppRouteHandler<ReviewCompanyRoute> = async (c) => {
  try {
    const { id } = c.req.valid("param");
    const { action, comments } = c.req.valid("json");
    return c.json(
      await pasakService.reviewCompany(id, action, comments),
      HttpStatusCodes.OK
    );
  } catch (error) {
    const mapped = pasakError(error);
    return c.json({ message: mapped.message }, mapped.status);
  }
};

export const reviewVacancy: AppRouteHandler<ReviewVacancyRoute> = async (c) => {
  try {
    const { id } = c.req.valid("param");
    const { action, comments } = c.req.valid("json");
    return c.json(
      await pasakService.reviewVacancy(id, action, comments),
      HttpStatusCodes.OK
    );
  } catch (error) {
    if (error instanceof VacancyError) {
      return c.json({ message: error.message }, HttpStatusCodes.NOT_FOUND);
    }
    const mapped = pasakError(error);
    return c.json({ message: mapped.message }, mapped.status);
  }
};

export const listVacancies: AppRouteHandler<ListVacanciesRoute> = async (c) => {
  const { status } = c.req.valid("query");
  return c.json(
    await pasakService.listVacancies(status ?? "PENDING_APPROVAL"),
    HttpStatusCodes.OK
  );
};

export const setVacancyStatus: AppRouteHandler<SetVacancyStatusRoute> = async (
  c
) => {
  try {
    const { id } = c.req.valid("param");
    const { status } = c.req.valid("json");
    return c.json(
      await pasakService.setVacancyStatus(id, status),
      HttpStatusCodes.OK
    );
  } catch (error) {
    if (error instanceof VacancyError) {
      return c.json({ message: error.message }, HttpStatusCodes.NOT_FOUND);
    }
    const mapped = pasakError(error);
    return c.json({ message: mapped.message }, mapped.status);
  }
};

export const listEmployers: AppRouteHandler<ListEmployersRoute> = async (c) => {
  return c.json(await pasakService.listEmployers(), HttpStatusCodes.OK);
};

export const setTvetCapability: AppRouteHandler<
  SetTvetCapabilityRoute
> = async (c) => {
  try {
    const { id } = c.req.valid("param");
    const { hasTvetCapability } = c.req.valid("json");
    return c.json(
      await pasakService.setTvetCapability(id, hasTvetCapability),
      HttpStatusCodes.OK
    );
  } catch (error) {
    const mapped = pasakError(error);
    return c.json({ message: mapped.message }, mapped.status);
  }
};
