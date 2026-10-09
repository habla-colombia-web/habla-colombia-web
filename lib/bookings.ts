export const BOOKING_STATUS = [
  "pendiente",
  "confirmada",
  "completada",
  "cancelada",
  "no asistio",
];

const LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
  "no asistio": "No asistió",
};

const CLASSES: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  confirmada: "bg-emerald-100 text-emerald-700",
  completada: "bg-sky-100 text-sky-700",
  cancelada: "bg-red-100 text-red-700",
  "no asistio": "bg-slate-200 text-slate-700",
};

export function statusLabel(s: string) {
  return LABELS[s] ?? s;
}

export function statusClass(s: string) {
  return CLASSES[s] ?? "bg-brand/10 text-brand";
}

export function bookingCode(id: number | string) {
  return `RES-${String(id).padStart(6, "0")}`;
}

export function whatsappLink(phone: string) {
  const d = phone.replace(/\D/g, "");
  const n = d.length === 10 ? `57${d}` : d;
  return `https://wa.me/${n}`;
}