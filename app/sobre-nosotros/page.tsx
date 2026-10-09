import Link from "next/link";

export default function SobreNosotrosPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-widest text-brand">
        Sobre nosotros
      </p>
      <h1 className="mt-2 text-3xl font-bold text-navy">
        Español real, vida real
      </h1>
      <div className="mt-6 space-y-4 leading-relaxed text-foreground">
        <p>
          Habla Colombia nació para que aprender español sea algo práctico,
          natural y divertido. Combinamos clases online con profesores nativos
          y recorridos con guías locales, para que practiques el idioma
          mientras conoces Colombia.
        </p>
        <p>
          Creemos que un idioma se aprende usándolo: en una conversación, en un
          viaje, en el trabajo y en la vida diaria. Por eso nuestros cursos
          parten de situaciones reales.
        </p>
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