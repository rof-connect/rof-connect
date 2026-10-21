import type { Metadata } from "next";
import Link from "next/link";
import { QuestionnaireParcours } from "@/components/parcours/QuestionnaireParcours";

export const metadata: Metadata = {
  title: "Questionnaire de parcours | Royal On Field",
  description: "Calculez la date repère et comparez les parcours vers le softball collégial américain.",
};

export default function ParcoursPage() {
  return (
    <main className="min-h-screen bg-rof-noir">
      <div className="mx-auto max-w-3xl px-4 pt-4">
        <Link href="/" className="text-sm text-rof-gris underline">
          ← Retour
        </Link>
      </div>
      <QuestionnaireParcours />
    </main>
  );
}
