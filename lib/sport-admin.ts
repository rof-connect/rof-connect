import "server-only";
import { cookies } from "next/headers";

export type SportAdmin = "" | "softball" | "baseball";

/** Sport de gestion choisi par la Direction (mémorisé dans un témoin) : sépare le baseball et le softball dans les pages de gestion. « » = les deux. */
export async function sportAdmin(): Promise<SportAdmin> {
  const v = (await cookies()).get("rof-sport-admin")?.value;
  return v === "softball" || v === "baseball" ? v : "";
}
