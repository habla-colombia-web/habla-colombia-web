import Link from "next/link";
import { getContent } from "@/lib/content";

export default async function SobreNosotrosPage() {
  const content = await getContent();
  const paragraphs = content.about_text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-widest text-brand">
        Sobre nosotros
      </p>
      <h1 className="mt-2 text-3xl font-bold text-navy">
        Español real, vida real
      </h1>
      <div className="mt-6 space-y-4 leading-relaxed text-foreground">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/#cursos"
          className="rounded-full bg-gold px-6 py-3 font-semibold text-navy hover:brightness-95"
        >
          Ver cursos
        </Link>
        <Link
          href="/#turismo"
          className="rounded-full border border-navy px-6 py-3 font-semibold text-navy"
        >
          Ver lugares
        </Link>
      </div>
    </section>
  );
}