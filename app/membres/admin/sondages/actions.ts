"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TAILLE_MAX_IMAGE = 5 * 1024 * 1024;

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
  revalidatePath("/membres/admin/sondages");
  revalidatePath("/membres/sondages");
}

export async function creerSondage(formData: FormData) {
  if (!(await verifierAdmin())) return;
  const titre = String(formData.get("titre") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const teamId = String(formData.get("team_id") ?? "") || null;
  const options = String(formData.get("options") ?? "")
    .split("\n")
    .map((o) => o.trim())
    .filter(Boolean)
    .slice(0, 12);
  const kind = String(formData.get("kind") ?? "choix") === "date" ? "date" : "choix";
  if (!titre || (kind === "choix" && options.length < 2)) return;

  const admin = createAdminClient();
  const { data: poll } = await admin
    .from("polls")
    .insert({ title: titre, description, team_id: teamId, kind })
    .select("id")
    .single();
  if (!poll) return;
  if (kind === "choix") {
    await admin.from("poll_options").insert(options.map((label, i) => ({ poll_id: poll.id, label, position: i })));
  }
  rafraichir();
}

export async function majOptionSondage(formData: FormData) {
  if (!(await verifierAdmin())) return;
  const optionId = String(formData.get("option_id") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const photo = formData.get("photo") as File | null;
  if (!optionId || !label) return;

  const admin = createAdminClient();
  const champs: { label: string; image_path?: string } = { label };

  if (photo && photo.size > 0) {
    if (photo.size > TAILLE_MAX_IMAGE || !photo.type.startsWith("image/")) return;
    const { data: option } = await admin.from("poll_options").select("poll_id, image_path").eq("id", optionId).single();
    if (!option) return;
    const ext = photo.type === "image/png" ? "png" : "jpg";
    const chemin = `sondages/${option.poll_id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await admin.storage.from("media").upload(chemin, photo, { contentType: photo.type });
    if (error) return;
    if (option.image_path) await admin.storage.from("media").remove([option.image_path]);
    champs.image_path = chemin;
  }

  await admin.from("poll_options").update(champs).eq("id", optionId);
  rafraichir();
}

export async function ajouterOptionSondage(formData: FormData) {
  if (!(await verifierAdmin())) return;
  const pollId = String(formData.get("poll_id") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  if (!pollId || !label) return;
  const admin = createAdminClient();
  const { count } = await admin.from("poll_options").select("id", { count: "exact", head: true }).eq("poll_id", pollId);
  await admin.from("poll_options").insert({ poll_id: pollId, label, position: count ?? 0 });
  rafraichir();
}

export async function supprimerOptionSondage(formData: FormData) {
  if (!(await verifierAdmin())) return;
  const optionId = String(formData.get("option_id") ?? "");
  if (!optionId) return;
  const admin = createAdminClient();
  const { data: option } = await admin.from("poll_options").select("image_path").eq("id", optionId).single();
  await admin.from("poll_options").delete().eq("id", optionId);
  if (option?.image_path) await admin.storage.from("media").remove([option.image_path]);
  rafraichir();
}

export async function basculerSondage(formData: FormData) {
  if (!(await verifierAdmin())) return;
  const pollId = String(formData.get("poll_id") ?? "");
  const fermer = formData.get("fermer") === "1";
  if (!pollId) return;
  await createAdminClient().from("polls").update({ closed: fermer }).eq("id", pollId);
  rafraichir();
}

export async function supprimerSondage(formData: FormData) {
  if (!(await verifierAdmin())) return;
  const pollId = String(formData.get("poll_id") ?? "");
  if (!pollId) return;
  const admin = createAdminClient();
  const { data: options } = await admin.from("poll_options").select("image_path").eq("poll_id", pollId);
  await admin.from("polls").delete().eq("id", pollId);
  const chemins = (options ?? []).map((o) => o.image_path).filter(Boolean) as string[];
  if (chemins.length) await admin.storage.from("media").remove(chemins);
  rafraichir();
}

export async function majImageSondage(formData: FormData) {
  if (!(await verifierAdmin())) return;
  const pollId = String(formData.get("poll_id") ?? "");
  const photo = formData.get("photo") as File | null;
  if (!pollId || !photo || photo.size === 0) return;
  if (photo.size > TAILLE_MAX_IMAGE || !photo.type.startsWith("image/")) return;

  const admin = createAdminClient();
  const { data: poll } = await admin.from("polls").select("image_path").eq("id", pollId).single();
  if (!poll) return;
  const chemin = `sondages/${pollId}/${crypto.randomUUID()}.${photo.type === "image/png" ? "png" : "jpg"}`;
  const { error } = await admin.storage.from("media").upload(chemin, photo, { contentType: photo.type });
  if (error) return;
  if (poll.image_path) await admin.storage.from("media").remove([poll.image_path]);
  await admin.from("polls").update({ image_path: chemin }).eq("id", pollId);
  rafraichir();
}
