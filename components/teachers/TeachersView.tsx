import { getSupabase } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import { formatClassDate } from "@/lib/teachers";
import TeacherDirectory, { type TeacherCard } from "./TeacherDirectory";

type Teacher = {
  id: string;
  name: string;
  specialty: string | null;
  bio: string | null;
  image_url: string | null;
};
type LessonRef = { teacher_id: string | null; starts_at: string | null };

export default async function TeachersView({ basePath }: { basePath: string }) {
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

  // Próxima clase en vivo por profesor (solo lo que la sesión actual puede ver)
  const next = new Map<string, string>();
  if (teachers.length > 0) {
    try {
      const sb = await createClient();
      const { data } = await sb
        .from("lessons")
        .select("teacher_id,starts_at")
        .eq("kind", "en_vivo")
        .eq("is_published", true)
        .in("teacher_id", teachers.map((t) => t.id))
        .gte("starts_at", new Date().toISOString())
        .order("starts_at");
      for (const l of (data ?? []) as unknown as LessonRef[]) {
        if (l.teacher_id && l.starts_at && !next.has(l.teacher_id)) {
          next.set(l.teacher_id, formatClassDate(l.starts_at));
        }
      }
    } catch {
      /* sin horarios visibles */
    }
  }

  const cards: TeacherCard[] = teachers.map((t) => ({
    ...t,
    nextClass: next.get(t.id) ?? null,
  }));

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-widest text-brand">
        Nuestro equipo
      </p>
      <h1 className="mt-2 text-3xl font-bold text-navy">Nuestros profesores</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Elige un profesor de español colombiano, conoce su perfil y mira cuándo
        tiene clases.
      </p>

      {cards.length === 0 ? (
        <p className="mt-8 text-muted">
          Pronto publicaremos los perfiles de cada profesor.
        </p>
      ) : (
        <TeacherDirectory teachers={cards} basePath={basePath} />
      )}
    </section>
  );
}