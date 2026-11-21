"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { chargerLfjmq, lireClassement, sauverLfjmq } from "@/lib/lfjmq";
import { idGameChanger, lienGameChanger } from "@/lib/site-v2/donnees";

async function verifierAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "admin" ? user : null;
}

function rafraichir() {
  revalidatePath("/membres/admin/lfjmq");
  revalidatePath("/lfjmq", "layout");
}

export async function majClassement(formData: FormData) {
  if (!(await verifierAdmin())) return;
  const d = await chargerLfjmq();
  d.divisions = lireClassement(String(formData.get("classement") ?? "").slice(0, 20000));
  d.maj = new Date().toISOString();
  await sauverLfjmq(d);
  rafraichir();
}

export async function majLiensLfjmq(formData: FormData) {
  if (!(await verifierAdmin())) return;
  const d = await chargerLfjmq();
  d.widgetId = idGameChanger(formData.get("widget_id"));
  d.lienClassement = lienGameChanger(formData.get("lien_classement"));
  d.lienHoraire = lienGameChanger(formData.get("lien_horaire"));
  await sauverLfjmq(d);
  rafraichir();
}

export async function ajouterResume(formData: FormData) {
  if (!(await verifierAdmin())) return;
  const titre = String(formData.get("titre") ?? "").trim().slice(0, 120);
  const fr = String(formData.get("fr") ?? "").trim().slice(0, 4000);
  const en = String(formData.get("en") ?? "").trim().slice(0, 4000);
  const date = String(formData.get("date") ?? "");
  if (!titre || !fr || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
  const d = await chargerLfjmq();
  d.resumes.push({ id: crypto.randomUUID(), date, titre, fr, en, lien: lienGameChanger(formData.get("lien")) });
  await sauverLfjmq(d);
  rafraichir();
}

export async function supprimerResume(formData: FormData) {
  if (!(await verifierAdmin())) return;
  const id = String(formData.get("id") ?? "");
  const d = await chargerLfjmq();
  d.resumes = d.resumes.filter((r) => r.id !== id);
  await sauverLfjmq(d);
  rafraichir();
}
