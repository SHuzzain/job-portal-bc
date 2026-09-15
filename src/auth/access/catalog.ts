/**
 * Every resource and the actions its routes genuinely support. This is the
 * single source of truth for both access-control catalogs and the permission
 * matrix UI, so a resource never advertises an action that has no endpoint.
 */
export const RESOURCES = {
  seeker_profile: ["view", "update"],
  resume: ["view", "create", "delete"],
  seeker_application: ["view", "create"],
  tvet_attendance: ["view", "scan"],
  tvet_certificate: ["view", "submit_survey", "download"],
  company: ["view", "create", "update", "resubmit"],
  vacancy: ["view", "create", "update", "delete", "resubmit"],
  applicant: ["view", "shortlist", "reject", "hire", "follow_up"],
  interview: ["view", "schedule"],
  tvet_rfp: ["view", "create", "update", "close"],
  tvet_session: ["view", "create"],
  tvet_claim: ["view", "create", "upload_signed", "download"],
  company_review: ["view", "approve", "reject", "return"],
  vacancy_review: ["view", "approve", "reject", "return"],
  tvet_capability: ["view", "grant", "revoke"],
  claim_review: ["view", "approve", "reject", "finalize"],
  platform_user: ["view", "create", "update", "set_role"],
  platform_role: ["view", "create", "update", "delete"],
  org_member: ["view", "invite", "update_role", "remove"],
  org_role: ["view", "create", "update", "delete"],
  notification: ["view", "mark_read"],
} as const;

export type ResourceKey = keyof typeof RESOURCES;
export type PermissionMap = Record<string, string[]>;

/** Grouping used by the permission matrix UI. */
export const MODULES = [
  {
    module: "seeker",
    scope: "platform",
    resources: [
      "seeker_profile",
      "resume",
      "seeker_application",
      "tvet_attendance",
      "tvet_certificate",
    ],
  },
  {
    module: "employer",
    scope: "both",
    resources: ["company", "vacancy", "applicant", "interview"],
  },
  {
    module: "tvet",
    scope: "both",
    resources: ["tvet_rfp", "tvet_session", "tvet_claim"],
  },
  {
    module: "pasak",
    scope: "platform",
    resources: [
      "company_review",
      "vacancy_review",
      "tvet_capability",
      "claim_review",
    ],
  },
  {
    module: "administration",
    scope: "platform",
    resources: ["platform_user", "platform_role"],
  },
  {
    module: "company_access",
    scope: "both",
    resources: ["org_member", "org_role"],
  },
  {
    module: "shared",
    scope: "both",
    resources: ["notification"],
  },
] as const satisfies readonly {
  module: string;
  scope: "platform" | "organization" | "both";
  resources: readonly ResourceKey[];
}[];

function pick<K extends ResourceKey>(keys: readonly K[]) {
  return Object.fromEntries(keys.map((key) => [key, RESOURCES[key]])) as Pick<
    typeof RESOURCES,
    K
  >;
}

export const PLATFORM_RESOURCE_KEYS = [
  "seeker_profile",
  "resume",
  "seeker_application",
  "tvet_attendance",
  "tvet_certificate",
  "company",
  "vacancy",
  "applicant",
  "interview",
  "tvet_rfp",
  "tvet_session",
  "tvet_claim",
  "company_review",
  "vacancy_review",
  "tvet_capability",
  "claim_review",
  "platform_user",
  "platform_role",
  "org_member",
  "org_role",
  "notification",
] as const;

export const ORGANIZATION_RESOURCE_KEYS = [
  "company",
  "vacancy",
  "applicant",
  "interview",
  "tvet_rfp",
  "tvet_session",
  "tvet_claim",
  "org_member",
  "org_role",
  "notification",
] as const;

export const platformResourceStatements = pick(PLATFORM_RESOURCE_KEYS);
export const organizationResourceStatements = pick(ORGANIZATION_RESOURCE_KEYS);

export function actionsFor(resource: string): readonly string[] {
  return RESOURCES[resource as ResourceKey] ?? [];
}

/** Every action of every resource in the given statement set. */
export function fullPermissions(
  statements: Record<string, readonly string[]>
): PermissionMap {
  return Object.fromEntries(
    Object.entries(statements).map(([resource, actions]) => [
      resource,
      [...actions],
    ])
  );
}

/** Drops resources and actions that are not part of the given statement set. */
export function sanitizePermissions(
  permissions: PermissionMap | null | undefined,
  statements: Record<string, readonly string[]>
): PermissionMap {
  const result: PermissionMap = {};
  if (!permissions) {
    return result;
  }
  for (const [resource, actions] of Object.entries(permissions)) {
    const allowed = statements[resource];
    if (!allowed || !Array.isArray(actions)) {
      continue;
    }
    const kept = allowed.filter((action) => actions.includes(action));
    if (kept.length > 0) {
      result[resource] = kept;
    }
  }
  return result;
}

export function hasPermission(
  permissions: PermissionMap | null | undefined,
  resource: string,
  action: string
) {
  return Boolean(permissions?.[resource]?.includes(action));
}
