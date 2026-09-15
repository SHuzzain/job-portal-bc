import * as HttpStatusCodes from "stoker/http-status-codes";

import { authedSession } from "../../lib/session.ts";
import type { AppRouteHandler } from "../../lib/types.ts";
import type {
  ListMineRoute,
  MarkAllReadRoute,
  MarkReadRoute,
  UnreadCountRoute,
} from "./notifications.route.ts";
import { NotificationError } from "./notifications.service.ts";
import * as notificationsService from "./notifications.service.ts";

export const listMine: AppRouteHandler<ListMineRoute> = async (c) => {
  const session = authedSession(c);

  return c.json(
    await notificationsService.listMine(session.user.id),
    HttpStatusCodes.OK
  );
};

export const unreadCount: AppRouteHandler<UnreadCountRoute> = async (c) => {
  const session = authedSession(c);

  return c.json(
    await notificationsService.unreadCount(session.user.id),
    HttpStatusCodes.OK
  );
};

export const markRead: AppRouteHandler<MarkReadRoute> = async (c) => {
  const session = authedSession(c);

  try {
    const { id } = c.req.valid("param");
    return c.json(
      await notificationsService.markRead(session.user.id, id),
      HttpStatusCodes.OK
    );
  } catch (error) {
    if (error instanceof NotificationError) {
      return c.json({ message: error.message }, HttpStatusCodes.NOT_FOUND);
    }
    throw error;
  }
};

export const markAllRead: AppRouteHandler<MarkAllReadRoute> = async (c) => {
  const session = authedSession(c);

  return c.json(
    await notificationsService.markAllRead(session.user.id),
    HttpStatusCodes.OK
  );
};
