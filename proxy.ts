import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  // Ancienne adresse de l'accueil du site public → adresse finale (308) : /baseball, ou « / » sur royalonfield.ca (softball).
  const url = request.nextUrl;
  if (url.pathname === "/site-v2") {
    const baseball = url.searchParams.get("sport") === "baseball";
    const principal = (request.headers.get("host") ?? "").replace(/:\d+$/, "") === "royalonfield.ca";
    if (baseball || principal) {
      const cible = url.clone();
      cible.pathname = baseball ? "/baseball" : "/";
      cible.searchParams.delete("sport");
      return NextResponse.redirect(cible, 308);
    }
  }
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
