export const SUPPORTED_LANGUAGES = {
  en: {
    label: "English",
    nativeLabel: "English",
    speechLocale: "en-IN"
  },
  hi: {
    label: "Hindi",
    nativeLabel: "हिन्दी",
    speechLocale: "hi-IN"
  },
  bn: {
    label: "Bengali",
    nativeLabel: "বাংলা",
    speechLocale: "bn-IN"
  },
  mr: {
    label: "Marathi",
    nativeLabel: "मराठी",
    speechLocale: "mr-IN"
  },
  ta: {
    label: "Tamil",
    nativeLabel: "தமிழ்",
    speechLocale: "ta-IN"
  }
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;
