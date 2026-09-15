import { i18n, locales } from "@better-auth/i18n";

import { ms } from "./i18n-ms.ts";

function resolveAppLocale(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const code = value.split(",")[0]?.trim().split("-")[0]?.toLowerCase();
  return code === "en" || code === "ms" ? code : null;
}

export const i18nPlugin = i18n({
  defaultLocale: "en",
  translations: {
    en: locales.en,
    ms,
  },
  detection: ["callback", "header"],
  getLocale: (ctx) => resolveAppLocale(ctx.headers?.get("x-locale")),
});
