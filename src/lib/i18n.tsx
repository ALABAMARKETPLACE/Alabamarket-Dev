import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "../languages/english.json";
import ml from "../languages/malayalam.json";
import ar from "../languages/arabic.json";
import es from "../languages/spanish.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      es: {
        translation: es,
      },
      ml: {
        translation: ml,
      },
      ar: {
        translation: ar,
      },
    },
    fallbackLng: "en",
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["navigator"],
    },
  });

export default i18n;
