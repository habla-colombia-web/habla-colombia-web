export function safeHttps(v: string | null | undefined): string | null {
  if (!v) return null;
  try {
    const u = new URL(v.trim());
    return u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

const ID = /^[\w-]{6,20}$/;

export function embedUrl(v: string | null | undefined): string | null {
  const href = safeHttps(v);
  if (!href) return null;
  const u = new URL(href);
  const host = u.hostname.replace(/^www\./, "").replace(/^m\./, "");
  if (host === "youtube.com") {
    let id = u.searchParams.get("v");
    const m = u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/);
    if (!id && m) id = m[1];
    return id && ID.test(id)
      ? `https://www.youtube-nocookie.com/embed/${id}`
      : null;
  }
  if (host === "youtu.be") {
    const id = u.pathname.slice(1);
    return ID.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const m = u.pathname.match(/(\d{6,})/);
    return m ? `https://player.vimeo.com/video/${m[1]}` : null;
  }
  return null;
}

// Colombia es UTC-5 todo el año (sin horario de verano).
export function toBogotaInput(iso: string | null): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  return new Date(t - 5 * 3600000).toISOString().slice(0, 16);
}

export function fromBogotaInput(v: string): string | null {
  if (!v) return null;
  const d = new Date(`${v}:00-05:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function formatBogota(iso: string): string {
  return new Date(iso).toLocaleString("es-CO", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Bogota",
  });
}