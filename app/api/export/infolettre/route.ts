import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chargerAbonnes } from "@/lib/infolettre";

/** Liste des abonnés à l'infolettre en CSV (Direction seulement). */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { data: moi } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (moi?.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const abonnes = await chargerAbonnes();
  const lignes = ["courriel;sport;date", ...abonnes.map((a) => [a.courriel, a.sport, a.date.slice(0, 10)].join(";"))];
  return new NextResponse("﻿" + lignes.join("\r\n"), {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="infolettre.csv"' },
  });
}
