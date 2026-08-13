import "server-only";
import { cookies } from "next/headers";
import { LOCALES, LOCALE_PAR_DEFAUT, COOKIE_LANGUE, type Locale } from "./config";
import { dictionnaires } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const valeur = store.get(COOKIE_LANGUE)?.value;
  return (LOCALES as readonly string[]).includes(valeur ?? "") ? (valeur as Locale) : LOCALE_PAR_DEFAUT;
}

export async function getDictionnaire() {
  const locale = await getLocale();
  return { locale, t: dictionnaires[locale] };
}
