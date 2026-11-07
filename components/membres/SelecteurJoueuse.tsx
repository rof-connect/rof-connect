"use client";

import { useRef } from "react";

export function SelecteurJoueuse({
  membres,
  actuelId,
  action,
  label,
}: {
  membres: { id: string; full_name: string | null }[];
  actuelId: string;
  action: (formData: FormData) => void | Promise<void>;
  label: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={action} className="min-w-0">
      <label className="sr-only" htmlFor="selecteur-joueuse">
        {label}
      </label>
      <select
        id="selecteur-joueuse"
        name="profile_id"
        defaultValue={actuelId}
        onChange={() => formRef.current?.requestSubmit()}
        className="max-w-[9.5rem] truncate rounded-full border border-rof-royal bg-rof-royal-sombre px-3 py-1 font-condensed text-xs font-semibold uppercase tracking-wide text-rof-poudre"
      >
        {membres.map((m) => (
          <option key={m.id} value={m.id}>
            {m.full_name || "—"}
          </option>
        ))}
      </select>
    </form>
  );
}
