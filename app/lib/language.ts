export type SupportedLanguage = "ru" | "en";

const CYRILLIC_REGEX = /[А-Яа-яЁё]/g;
const LATIN_REGEX = /[A-Za-z]/g;

export const detectLanguage = (texts: Array<string | null | undefined>): SupportedLanguage => {
  const combined = texts.filter(Boolean).join(" ").trim();
  if (!combined) {
    return "en";
  }

  const cyrillicCount = (combined.match(CYRILLIC_REGEX) || []).length;
  const latinCount = (combined.match(LATIN_REGEX) || []).length;

  if (cyrillicCount > 0 && cyrillicCount >= latinCount) {
    return "ru";
  }

  return "en";
};

export const getLanguageInstruction = (language: SupportedLanguage): string => {
  return language === "ru"
    ? "Весь итоговый текст должен быть написан на русском языке."
    : "Write the final response in English.";
};

