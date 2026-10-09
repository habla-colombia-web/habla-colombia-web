import TutorChat from "@/components/practice/TutorChat";

export const dynamic = "force-dynamic";

export default function PracticarPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-widest text-brand">
        Practicar con IA
      </p>
      <h1 className="mt-2 text-3xl font-bold text-navy">Tu tutor virtual</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Elige una situación y conversa en español colombiano. Después de cada
        mensaje, el tutor te responde y te corrige.
      </p>
      <TutorChat />
    </section>
  );
}