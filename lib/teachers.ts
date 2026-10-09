export const TEACHER_AREAS = [
  { key: "conversacion", label: "Conversación", words: ["conversacion"] },
  { key: "viajeros", label: "Español para viajeros", words: ["viajer", "viaj"] },
  { key: "trabajar", label: "Español para trabajar", words: ["trabaj", "profesional"] },
  { key: "cero", label: "Desde cero", words: ["cero", "principiante"] },
];

export function norm(s: string | null | undefined): string {
  return (s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function matchesArea(specialty: string | null, areaKey: string): boolean {
  if (!areaKey) return true;
  const area = TEACHER_AREAS.find((a) => a.key === areaKey);
  if (!area) return true;
  const s = norm(specialty);
  return area.words.some((w) => s.includes(w));
}

export function formatClassDate(iso: string): string {
  return new Date(iso).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    dateStyle: "medium",
    timeStyle: "short",
  });
}