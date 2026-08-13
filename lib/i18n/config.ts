export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_PAR_DEFAUT: Locale = "fr";
export const COOKIE_LANGUE = "rof_locale";
