export const WORKSPACES = ["employer", "training_provider"] as const;

export type Workspace = (typeof WORKSPACES)[number];

export const TVET_WORKSPACE_RESOURCES = new Set([
  "tvet_rfp",
  "tvet_session",
  "tvet_claim",
]);

export const EMPLOYER_WORKSPACE_RESOURCES = new Set([
  "vacancy",
  "applicant",
  "interview",
]);

type WorkspaceUser = {
  role?: unknown;
  hasTvetCapability?: unknown;
  activeWorkspace?: unknown;
};

export function isWorkspace(value: unknown): value is Workspace {
  return value === "employer" || value === "training_provider";
}

export function isPasakRole(role: unknown) {
  return role === "admin" || role === "super_admin";
}

export function effectiveWorkspace(user: WorkspaceUser): Workspace {
  if (
    user.hasTvetCapability === true &&
    user.activeWorkspace === "training_provider"
  ) {
    return "training_provider";
  }

  return "employer";
}

/** Role name used to load platform_role permissions for this session. */
export function permissionRoleName(user: WorkspaceUser) {
  const role = typeof user.role === "string" ? user.role : null;
  if (role !== "employer") {
    return role;
  }

  return effectiveWorkspace(user) === "training_provider"
    ? "training_provider"
    : "employer";
}
