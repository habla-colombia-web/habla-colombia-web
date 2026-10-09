import Hero from "@/components/landing/Hero";
import { getContent } from "@/lib/content";
import Features from "@/components/landing/Features";
import Testimonial from "@/components/landing/Testimonial";
import CourseGrid from "@/components/courses/CourseGrid";
import RegionTabs from "@/components/tourism/RegionTabs";
import { getSupabase } from "@/lib/supabase/public";
import type { Course, Place } from "@/types";

export const revalidate = 60;

export default async function Home() {
  const sb = getSupabase();
  const content = await getContent();
  const [coursesRes, placesRes] = await Promise.all([
    sb
      .from("courses")
      .select("id,title,slug,short_description,image_url,level,price")
      .eq("is_published", true)
      .order("level")
      .order("title"),
    sb
      .from("places")
      .select("id,region,name,description,meta,image_url,sort")
      .order("sort"),
  ]);

  const courses = (coursesRes.data ?? []) as Course[];
  const places = (placesRes.data ?? []) as Place[];

  return (
    <>
      <Hero
        title={content.hero_title}
        highlight={content.hero_highlight}
        text={content.hero_text}
        image={content.hero_image}
      />
      <Features />

      <section id="cursos" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand">
              Nuestros cursos
            </p>
            <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">
              Elige el camino que se ajusta a tus objetivos
            </h2>
            <CourseGrid courses={courses} failed={Boolean(coursesRes.error)} />
          </div>
          <Testimonial
            quote={content.testimonial_quote}
            author={content.testimonial_author}
          />
        </div>
      </section>

      <section id="turismo" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">
            Lugares para conocer
          </p>
          <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">
            Practica español mientras recorres Colombia
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Elige una región, conoce sus lugares recomendados y separa tu
            recorrido con un guía local que habla español colombiano.
          </p>
          {placesRes.error ? (
            <p className="mt-8 text-muted">
              No pudimos cargar los lugares en este momento. Intenta de nuevo
              en unos minutos.
            </p>
          ) : (
            <RegionTabs places={places} />
          )}
        </div>
      </section>
    </>
  );
}