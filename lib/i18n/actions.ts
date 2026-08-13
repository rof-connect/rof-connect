"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { COOKIE_LANGUE, type Locale } from "./config";

export async function definirLangue(locale: Locale, chemin: string) {
  const store = await cookies();
  store.set(COOKIE_LANGUE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath(chemin);
}
