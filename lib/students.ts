export type LevelGroup = "Principiante" | "Intermedio" | "Avanzado" | "Otro";
export type StatusKey = "curso" | "pausa" | "completado";

export type StudentRaw = {
  st_user_id: string;
  st_name: string;
  st_email: string;
  st_course_id: string;
  st_course_title: string;
  st_level: string | null;
  st_status: string;
  st_enrolled_at: string;
  st_total: number;
  st_done: number;
  st_last_at: string | null;
  st_last_lesson: string | null;
};

export type Student = {
  key: string;
  userId: string;
  name: string;
  email: string;
  courseTitle: string;
  level: LevelGroup;
  status: StatusKey;
  percent: number;
  enrolledAt: string;
  lastAt: string | null;
  lastLesson: string | null;
};

export const LEVELS: LevelGroup[] = [
  "Principiante",
  "Intermedio",
  "Avanzado",
  "Otro",
];

export const STATUS_LABEL: Record<StatusKey, string> = {
  curso: "En curso",
  pausa: "En pausa",
  completado: "Completado",
};

export const LEVEL_COLOR: Record<LevelGroup, string> = {
  Principiante: "#1d6fe0",
  Intermedio: "#8b5cf6",
  Avanzado: "#f5b301",
  Otro: "#9ca3af",
};

export function levelGroup(level: string | null): LevelGroup {
  const v = (level ?? "").trim().toLowerCase();
  if (v.startsWith("a1") || v.includes("princip") || v.includes("beginner")) {
    return "Principiante";
  }
  if (v.startsWith("a2") || v.startsWith("b1") || v.includes("inter")) {
    return "Intermedio";
  }
  if (v.startsWith("b2") || v.startsWith("c") || v.includes("avanz") || v.includes("advanced")) {
    return "Avanzado";
  }
  return "Otro";
}

export function toStudent(r: StudentRaw): Student {
  const percent =
    r.st_total > 0
      ? Math.min(100, Math.round((r.st_done / r.st_total) * 100))
      : 0;
  let status: StatusKey = "curso";
  if (r.st_status === "pausada") status = "pausa";
  else if (r.st_total > 0 && r.st_done >= r.st_total) status = "completado";
  return {
    key: `${r.st_user_id}:${r.st_course_id}`,
    userId: r.st_user_id,
    name: r.st_name,
    email: r.st_email,
    courseTitle: r.st_course_title,
    level: levelGroup(r.st_level),
    status,
    percent,
    enrolledAt: r.st_enrolled_at,
    lastAt: r.st_last_at,
    lastLesson: r.st_last_lesson,
  };
}

const PALETTE = [
  "#1d6fe0",
  "#8b5cf6",
  "#0f9d73",
  "#e0791d",
  "#d6336c",
  "#0e8aa8",
  "#5b6ee1",
];

export function avatarColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function initial(name: string): string {
  const c = name.trim().charAt(0);
  return c ? c.toUpperCase() : "?";
}

export function timeAgo(iso: string | null, now: number): string {
  if (!iso) return "Sin actividad";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "Sin actividad";
  const min = Math.max(0, Math.floor((now - t) / 60000));
  if (min < 60) return `Hace ${Math.max(1, min)} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Hace ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "Hace 1 día" : `Hace ${d} días`;
}