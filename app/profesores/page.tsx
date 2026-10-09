import Link from "next/link";
import { GraduationCap, MessagesSquare, Plane, Briefcase } from "lucide-react";
import { getSupabase } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

type Teacher = {
  id: string;
  name: string;
  specialty: string | null;
  bio: string | null;
  image_url: string | null;
};

const AREAS = [
  {
    icon: MessagesSquare,
    title: "Conversación",
    text: "Clases enfocadas en hablar con soltura y entender el español de la calle.",
  },
  {
    icon: Plane,
    title: "Español para viajeros",
    text: "Frases, vocabulario y situaciones reales para moverte por Colombia.",
  },
  {
    icon: Briefcase,
    title: "Español para trabajar",
    text: "Reuniones, correos y entrevistas en un entorno profesional.",
  },
  {
    icon: GraduationCap,
    title: "Desde cero",
    text: "Acompañamiento paso a paso para quienes empiezan.",
  },
];

export default async function ProfesoresPage() {
  let teachers: Teacher[] = [];
  try {
    const { data } = await getSupabase()
      .from("teachers")
      .select("id,name,specialty,bio,image_url")
      .eq("is_published", true)
      .order("sort")
      .order("name");
    teachers = (data ?? []) as Teacher[];
  } catch {
    teachers = [];
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-widest text-brand">
        Nuestro equipo
      </p>
      <h1 className="mt-2 text-3xl font-bold text-navy">
        Profesores nativos y certificados
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Docentes colombianos con experiencia y pasión por enseñar.
        {teachers.length === 0 && " Pronto publicaremos los perfiles de cada profesor."}
      </p>

      {teachers.length > 0 && (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((t) => (
            <article
              key={t.id}
              className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
            >
              {t.image_url ? (
                <div
                  role="img"
                  aria-label={t.name}
                  className="h-72 w-full bg-cover bg-top"
                  style={{ backgroundImage: `url("${t.image_url}")` }}
                />
              ) : (
                <div className="flex h-72 w-full items-center justify-center bg-linear-to-br from-brand to-navy text-6xl font-bold text-white">
                  {t.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="p-5">
                <h2 className="text-lg font-bold text-navy">{t.name}</h2>
                {t.specialty && (
                  <p className="text-sm font-semibold text-brand">{t.specialty}</p>
                )}
                {t.bio && (
                  <p className="mt-2 text-sm leading-relaxed text-muted">{t.bio}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <h2 className="mt-14 text-2xl font-bold text-navy">Áreas de enseñanza</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {AREAS.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Icon size={22} aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-base font-bold text-navy">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
          </div>
        ))}
      </div>

      <Link
        href="/#cursos"
        className="mt-10 inline-block rounded-full bg-gold px-6 py-3 font-semibold text-navy hover:brightness-95"
      >
        Ver cursos
      </Link>
    </section>
  );
}