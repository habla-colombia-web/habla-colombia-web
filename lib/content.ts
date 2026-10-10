import { getSupabase } from "@/lib/supabase/public";

export const CONTENT_DEFAULTS = {
  hero_title: "Habla español, vive la experiencia",
  hero_highlight: "de Colombia",
  hero_text:
    "Aprende español de forma práctica, natural y divertida. Con profesores nativos, situaciones reales y una comunidad internacional que, como tú, quiere vivir nuevas experiencias.",
  hero_image: "",
  social_facebook: "",
  social_instagram: "",
  social_x: "",
  social_whatsapp: "",
  testimonial_quote:
    "Ahora puedo poner en práctica lo que aprendí y hablar con los locales sin miedo.",
  testimonial_author: "James, Estados Unidos",
  testimonial_image: "",
  feature_1_image: "",
  feature_2_image: "",
  feature_3_image: "",
  feature_4_image: "",
  feature_5_image: "",
  about_text:
    "Habla Colombia nació para que aprender español sea algo práctico, natural y divertido. Combinamos clases online con profesores nativos y recorridos con guías locales, para que practiques el idioma mientras conoces Colombia.\n\nCreemos que un idioma se aprende usándolo: en una conversación, en un viaje, en el trabajo y en la vida diaria. Por eso nuestros cursos parten de situaciones reales.",
};

export type ContentKey = keyof typeof CONTENT_DEFAULTS;
export type Content = Record<ContentKey, string>;

export async function getContent(): Promise<Content> {
  const content: Content = { ...CONTENT_DEFAULTS };
  try {
    const { data } = await getSupabase()
      .from("site_content")
      .select("key,value");
    for (const row of data ?? []) {
      if (
        row.key in content &&
        typeof row.value === "string" &&
        row.value !== ""
      ) {
        content[row.key as ContentKey] = row.value;
      }
    }
  } catch {
    // Si falla la lectura se usan los textos por defecto.
  }
  return content;
}