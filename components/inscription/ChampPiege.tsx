import { CHAMP_PIEGE } from "@/lib/anti-pourriel";

/** Champ invisible : une personne ne le voit pas et ne peut pas y tabuler ; un robot le remplit. */
export function ChampPiege() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
      <label>
        Site web (laisser vide)
        <input type="text" name={CHAMP_PIEGE} tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
