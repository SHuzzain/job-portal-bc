import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "../../lib/types.ts";
import type {
  CreatePlatformRoleRoute,
  DeletePlatformRoleRoute,
  GetPlatformRoleRoute,
  ListPlatformRolesRoute,
  UpdatePlatformRoleRoute,
} from "./platform-roles.route.ts";
import { PlatformRoleError } from "./platform-roles.service.ts";
import * as service from "./platform-roles.service.ts";

function errorResponse(error: unknown) {
  if (error instanceof PlatformRoleError) {
    return { message: error.message, status: error.status } as const;
  }
  return null;
}

export const listPlatformRoles: AppRouteHandler<
  ListPlatformRolesRoute
> = async (c) => {
  return c.json(await service.listRoles(), HttpStatusCodes.OK);
};

export const getPlatformRole: AppRouteHandler<GetPlatformRoleRoute> = async (
  c
) => {
  try {
    return c.json(
      await service.getRole(c.req.valid("param").id),
      HttpStatusCodes.OK
    );
  } catch (error) {
    const handled = errorResponse(error);
    if (handled) {
      return c.json({ message: handled.message }, handled.status);
    }
    throw error;
  }
};

export const createPlatformRole: AppRouteHandler<
  CreatePlatformRoleRoute
> = async (c) => {
  try {
    return c.json(
      await service.createRole(c.req.valid("json")),
      HttpStatusCodes.CREATED
    );
  } catch (error) {
    const handled = errorResponse(error);
    if (handled) {
      return c.json({ message: handled.message }, handled.status);
    }
    throw error;
  }
};

export const updatePlatformRole: AppRouteHandler<
  UpdatePlatformRoleRoute
> = async (c) => {
  try {
    return c.json(
      await service.updateRole(c.req.valid("param").id, c.req.valid("json")),
      HttpStatusCodes.OK
    );
  } catch (error) {
    const handled = errorResponse(error);
    if (handled) {
      return c.json({ message: handled.message }, handled.status);
    }
    throw error;
  }
};

export const deletePlatformRole: AppRouteHandler<
  DeletePlatformRoleRoute
> = async (c) => {
  try {
    await service.deleteRole(c.req.valid("param").id);
    return c.body(null, HttpStatusCodes.NO_CONTENT);
  } catch (error) {
    const handled = errorResponse(error);
    if (handled) {
      return c.json({ message: handled.message }, handled.status);
    }
    throw error;
  }
};
