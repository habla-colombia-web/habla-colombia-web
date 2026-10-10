import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getContent } from "@/lib/content";
import ContentEditor from "@/components/admin/ContentEditor";
import FeatureImagesEditor from "@/components/admin/FeatureImagesEditor";
import ItemEditor, { type ItemField } from "@/components/admin/ItemEditor";

type CourseRow = {
  id: string;
  title: string;
  short_description: string | null;
  price: number;
  image_url: string | null;
};

type PlaceRow = {
  id: number;
  region: string;
  name: string;
  description: string | null;
  meta: string | null;
  image_url: string | null;
};

const COURSE_FIELDS: ItemField[] = [
  { key: "title", label: "Titulo", type: "text", required: true },
  { key: "short_description", label: "Descripcion", type: "textarea" },
  { key: "price", label: "Precio", type: "number", required: true },
  { key: "image_url", label: "Imagen", type: "image" },
];

const PLACE_FIELDS: ItemField[] = [
  { key: "name", label: "Nombre", type: "text", required: true },
  { key: "description", label: "Descripcion", type: "textarea" },
  { key: "meta", label: "Detalle corto (duracion, precio...)", type: "text" },
  { key: "image_url", label: "Imagen", type: "image" },
];

export default async function ContenidoPage() {
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");
  const { data: isAdmin } = await sb.rpc("is_admin");
  if (!isAdmin) redirect("/");

  const content = await getContent();
  const [coursesRes, placesRes] = await Promise.all([
    sb
      .from("courses")
      .select("id,title,short_description,price,image_url")
      .order("title"),
    sb
      .from("places")
      .select("id,region,name,description,meta,image_url")
      .order("sort"),
  ]);

  const courses = (coursesRes.data ?? []) as unknown as CourseRow[];
  const places = (placesRes.data ?? []) as unknown as PlaceRow[];

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <Link href="/admin" className="text-sm font-semibold text-brand">
        Volver al panel
      </Link>
      <h1 className="mt-2 text-3xl font-bold text-navy">
        Contenido e imagenes
      </h1>
      <p className="mt-2 text-sm text-muted">
        Las imagenes aceptan JPG, PNG o WEBP de hasta 5 MB. Despues de subir una
        imagen, pulsa Guardar para aplicarla.
      </p>

      <h2 className="mt-10 text-2xl font-bold text-navy">Textos y banner</h2>
      <ContentEditor initial={content} />

      <h2 className="mt-14 text-2xl font-bold text-navy">Cursos</h2>
      {coursesRes.error ? (
        <p className="mt-4 text-muted">No pudimos cargar los cursos.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {courses.map((c) => (
            <details
              key={c.id}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
            >
              <summary className="cursor-pointer text-base font-bold text-navy">
                {c.title}
              </summary>
              <div className="mt-4">
                <ItemEditor
                  table="courses"
                  id={c.id}
                  folder="courses"
                  fields={COURSE_FIELDS}
                  values={{
                    title: c.title,
                    short_description: c.short_description ?? "",
                    price: String(c.price),
                    image_url: c.image_url ?? "",
                  }}
                />
              </div>
            </details>
          ))}
        </div>
      )}

      <h2 className="mt-14 text-2xl font-bold text-navy">Lugares</h2>
      {placesRes.error ? (
        <p className="mt-4 text-muted">No pudimos cargar los lugares.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {places.map((p) => (
            <details
              key={p.id}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
            >
              <summary className="cursor-pointer text-base font-bold text-navy">
                {p.region} - {p.name}
              </summary>
              <div className="mt-4">
                <ItemEditor
                  table="places"
                  id={p.id}
                  folder="places"
                  fields={PLACE_FIELDS}
                  values={{
                    name: p.name,
                    description: p.description ?? "",
                    meta: p.meta ?? "",
                    image_url: p.image_url ?? "",
                  }}
                />
              </div>
            </details>
          ))}
        </div>
      )}
          <h2 className="mt-14 text-2xl font-bold text-navy">Tarjetas de beneficios</h2>
      <FeatureImagesEditor
        initial={{
          feature_1_image: content.feature_1_image,
          feature_2_image: content.feature_2_image,
          feature_3_image: content.feature_3_image,
          feature_4_image: content.feature_4_image,
          feature_5_image: content.feature_5_image,
        }}
      />
    </section>
  );
}