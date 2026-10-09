export const LEVELS = ["A1", "A2", "B1", "B2"] as const;
export type Level = (typeof LEVELS)[number];

export const SCENARIOS = {
  presentarse: {
    label: "Presentarse",
    setup: "Eres una persona colombiana que conoce al estudiante por primera vez en una reunión social.",
    opener: "¡Hola! Mucho gusto, me llamo Camila. ¿Y tú, cómo te llamas?",
  },
  restaurante: {
    label: "En un restaurante",
    setup: "Eres un mesero amable en un restaurante en Colombia. El estudiante es el cliente.",
    opener: "¡Buenas tardes! Bienvenido. ¿Mesa para cuántas personas?",
  },
  taxi: {
    label: "Tomar un taxi",
    setup: "Eres un taxista colombiano. El estudiante acaba de subirse a tu taxi.",
    opener: "¡Buenas! ¿Para dónde vamos?",
  },
  direcciones: {
    label: "Pedir direcciones",
    setup: "Eres una persona en la calle en una ciudad colombiana. El estudiante te pregunta cómo llegar a un lugar.",
    opener: "¡Hola! ¿Necesitas ayuda? Parece que estás perdido.",
  },
  entrevista: {
    label: "Entrevista de trabajo",
    setup: "Eres un entrevistador en una empresa colombiana. El estudiante es el candidato.",
    opener: "Buenos días, gracias por venir. Cuénteme, ¿a qué se dedica usted?",
  },
} as const;

export type ScenarioKey = keyof typeof SCENARIOS;

export function isScenario(k: unknown): k is ScenarioKey {
  return typeof k === "string" && Object.prototype.hasOwnProperty.call(SCENARIOS, k);
}

export function isLevel(l: unknown): l is Level {
  return typeof l === "string" && (LEVELS as readonly string[]).includes(l);
}