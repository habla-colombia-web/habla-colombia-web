import CourseCard from "./CourseCard";
import type { Course } from "@/types";

export default function CourseGrid({
  courses,
  failed,
}: {
  courses: Course[];
  failed: boolean;
}) {
  if (failed) {
    return (
      <p className="mt-8 text-muted">
        No pudimos cargar los cursos en este momento. Intenta de nuevo en unos
        minutos.
      </p>
    );
  }
  if (courses.length === 0) {
    return <p className="mt-8 text-muted">Pronto publicaremos nuevos cursos.</p>;
  }
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((c) => (
        <CourseCard key={c.id} course={c} />
      ))}
    </div>
  );
}