import { safeHttps } from "@/lib/lessons";

export type CategoryKey = "general" | "pregunta" | "practica" | "cultura" | "viajes";

export const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "general", label: "General" },
  { key: "pregunta", label: "Preguntas" },
  { key: "practica", label: "Práctica de español" },
  { key: "cultura", label: "Cultura colombiana" },
  { key: "viajes", label: "Viajes y experiencias" },
];

export const SPANISH_LEVELS = ["A1", "A2", "B1", "B2"] as const;
export const MAX_POST = 2000;
export const MAX_COMMENT = 1000;
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const POST_PAGE = 10;

export type Author = {
  display_name: string;
  avatar_url: string | null;
  country: string | null;
  spanish_level: string | null;
};

export type PostRow = {
  id: string;
  user_id: string;
  body: string;
  category: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  community_profiles: Author | Author[] | null;
};

export type CommentAuthor = { display_name: string; avatar_url: string | null };

export type CommentRow = {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  community_profiles: CommentAuthor | CommentAuthor[] | null;
};

export type MyProfile = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  country: string | null;
  native_language: string | null;
  spanish_level: string | null;
  interests: string | null;
  bio: string | null;
};

export const POST_SELECT =
  "id,user_id,body,category,image_url,likes_count,comments_count,created_at,community_profiles(display_name,avatar_url,country,spanish_level)";

export function one<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export function categoryLabel(key: string): string {
  return CATEGORIES.find((c) => c.key === key)?.label ?? "General";
}

export function safeImageUrl(v: string | null | undefined): string | null {
  return safeHttps(v);
}

export function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (s < 60) return "ahora";
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `hace ${d} d`;
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function friendlyError(message: string | null | undefined, fallback: string): string {
  if (message && message.includes("rate_limit")) {
    return "Has enviado muchos mensajes seguidos. Espera un poco e intenta de nuevo.";
  }
  return fallback;
}