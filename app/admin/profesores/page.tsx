import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TeacherEditor from "@/components/admin/TeacherEditor";

type TeacherRow = {
  id: string;
  name: string;
  specialty: string | null;
  bio: string | null;
  image_url: string | null;
  sort: number;
  is_published: boolean;
};

export default async function AdminProfesoresPage() {
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");
  const { data: isAdmin } = await sb.rpc("is_admin");
  if (!isAdmin) redirect("/");

  const { data, error } = await sb
    .from("teachers")
    .select("id,name,specialty,bio,image_url,sort,is_published")
    .order("sort")
    .order("name");

  const teachers = (data ?? []) as unknown as TeacherRow[];

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <Link href="/admin" className="text-sm font-semibold text-brand">
        Volver al panel
      </Link>
      <h1 className="mt-2 text-3xl font-bold text-navy">Profesores</h1>
      <p className="mt-2 text-sm text-muted">
        Las fotos aceptan JPG, PNG o WEBP de hasta 5 MB. Despues de subir una
        foto, pulsa Guardar para aplicarla.
      </p>

      <h2 className="mt-10 text-2xl font-bold text-navy">Agregar profesor</h2>
      <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <TeacherEditor />
      </div>

      <h2 className="mt-14 text-2xl font-bold text-navy">
        Profesores ({teachers.length})
      </h2>
      {error ? (
        <p className="mt-4 text-muted">No pudimos cargar los profesores.</p>
      ) : teachers.length === 0 ? (
        <p className="mt-4 text-muted">Aun no hay profesores.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {teachers.map((t) => (
            <details
              key={t.id}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
            >
              <summary className="cursor-pointer text-base font-bold text-navy">
                {t.name}
                {!t.is_published && (
                  <span className="ml-2 text-xs font-semibold text-muted">
                    (oculto)
                  </span>
                )}
              </summary>
              <div className="mt-4">
                <TeacherEditor
                  id={t.id}
                  values={{
                    name: t.name,
                    specialty: t.specialty ?? "",
                    bio: t.bio ?? "",
                    image_url: t.image_url ?? "",
                    sort: String(t.sort),
                    is_published: t.is_published,
                  }}
                />
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}