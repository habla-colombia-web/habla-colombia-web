import {
  Briefcase,
  Heart,
  House,
  Plane,
  Star,
  type LucideIcon,
} from "lucide-react";
import type { Course } from "@/types";

type CardStyle = { icon: LucideIcon; gradient: string; badge: string };

const STYLES: Record<string, CardStyle> = {
  "espanol-para-viajeros": {
    icon: Plane,
    gradient: "from-[#3b82c4] to-[#7cc27a]",
    badge: "bg-brand",
  },
  "espanol-para-vivir-en-colombia": {
    icon: House,
    gradient: "from-[#8a5a3a] to-[#e0a96d]",
    badge: "bg-emerald-600",
  },
  "espanol-para-trabajar": {
    icon: Briefcase,
    gradient: "from-[#2c3e5c] to-[#7a8aa8]",
    badge: "bg-violet-600",
  },
  "espanol-para-la-vida-social": {
    icon: Heart,
    gradient: "from-[#c96a7a] to-[#f0b27a]",
    badge: "bg-pink-600",
  },
  "espanol-desde-cero": {
    icon: Star,
    gradient: "from-[#4a7d6a] to-[#c9a45a]",
    badge: "bg-orange-500",
  },
};

const DEFAULT_STYLE: CardStyle = {
  icon: Star,
  gradient: "from-brand to-navy",
  badge: "bg-brand",
};

export default function CourseCard({ course }: { course: Course }) {
  const style = STYLES[course.slug] ?? DEFAULT_STYLE;
  const Icon = style.icon;
  const amount = Number(course.price);
  const price = amount === 0 ? "Gratis" : `$${amount.toLocaleString("es-CO")}`;

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      <div
        className={`relative h-28 bg-linear-to-br bg-cover bg-center ${style.gradient}`}
        style={
          course.image_url
            ? { backgroundImage: `url(${course.image_url})` }
            : undefined
        }
      >
        <span
          className={`absolute -bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-full text-white ring-4 ring-white ${style.badge}`}
        >
          <Icon size={18} aria-hidden="true" />
        </span>
      </div>
      <div className="px-4 pb-5 pt-6">
        <h3 className="text-sm font-bold text-navy">{course.title}</h3>
        {course.short_description && (
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {course.short_description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between text-xs font-semibold">
          <span className="rounded-full bg-brand/10 px-2 py-1 text-brand">
            Nivel {course.level}
          </span>
          <span className="text-navy">{price}</span>
        </div>
      </div>
    </article>
  );
}