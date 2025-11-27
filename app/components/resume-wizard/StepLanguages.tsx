import { useState } from "react";
import type { FormEvent } from "react";
import { useResumeStore } from "~/lib/resume-store";

const commonLanguages = [
  "Русский",
  "Английский",
  "Таджикский",
  "Немецкий",
  "Французский",
  "Испанский",
  "Итальянский",
  "Китайский",
  "Японский",
  "Корейский",
  "Арабский",
  "Турецкий",
  "Узбекский",
  "Казахский",
  "Украинский",
  "Польский",
  "Португальский",
  "Хинди",
];

const languageLevels: { value: LanguageLevel; label: string }[] = [
  { value: "native", label: "Родной" },
  { value: "fluent", label: "Свободно" },
  { value: "intermediate", label: "Средний" },
  { value: "basic", label: "Базовый" },
];

export default function StepLanguages() {
  const { resumeData, addLanguage, removeLanguage, nextStep, prevStep } =
    useResumeStore();
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [customLanguage, setCustomLanguage] = useState("");
  const [level, setLevel] = useState<LanguageLevel>("fluent");
  const [useCustom, setUseCustom] = useState(false);

  const languages = resumeData.languages || [];

  const handleAddLanguage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const languageName = useCustom
      ? customLanguage.trim()
      : selectedLanguage.trim();

    if (!languageName) {
      alert("Выберите или введите язык");
      return;
    }

    // Check if already added
    if (languages.some((lang) => lang.name === languageName)) {
      alert("Этот язык уже добавлен");
      return;
    }

    addLanguage({
      name: languageName,
      level,
    });

    // Reset form
    setSelectedLanguage("");
    setCustomLanguage("");
    setLevel("fluent");
    setUseCustom(false);
  };

  return (
    <div className="wizard-step">
      <h1 className="text-gradient">Языки</h1>
      <h2>Шаг 5: Добавьте языки</h2>
      <p className="text-dark-200 mb-6">
        Укажите языки, которыми вы владеете, и уровень владения.
      </p>

      <div className="w-full max-w-2xl space-y-6">
        {/* Current Languages */}
        {languages.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Ваши языки:</h3>
            <div className="space-y-2">
              {languages.map((lang) => (
                <div
                  key={lang.id}
                  className="flex items-center justify-between gradient-border p-4"
                >
                  <div>
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-gray-500 ml-2">
                      ({languageLevels.find((l) => l.value === lang.level)?.label})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLanguage(lang.id)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Language Form */}
        <form onSubmit={handleAddLanguage} className="space-y-4">
          <div className="form-div">
            <label>Выберите язык или введите свой</label>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  checked={!useCustom}
                  onChange={() => setUseCustom(false)}
                  className="w-5 h-5 cursor-pointer"
                />
                <span className="text-gray-700 group-hover:text-gray-900">Из списка</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  checked={useCustom}
                  onChange={() => setUseCustom(true)}
                  className="w-5 h-5 cursor-pointer"
                />
                <span className="text-gray-700 group-hover:text-gray-900">Свой вариант</span>
              </label>
            </div>

            {!useCustom ? (
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full p-4 inset-shadow rounded-2xl focus:outline-none bg-white"
                required
              >
                <option value="">Выберите язык</option>
                {commonLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={customLanguage}
                onChange={(e) => setCustomLanguage(e.target.value)}
                placeholder="Введите название языка"
                required
              />
            )}
          </div>

          <div className="form-div">
            <label htmlFor="language-level">Уровень владения</label>
            <select
              id="language-level"
              value={level}
              onChange={(e) => setLevel(e.target.value as LanguageLevel)}
              className="w-full p-4 inset-shadow rounded-2xl focus:outline-none bg-white"
            >
              {languageLevels.map((lvl) => (
                <option key={lvl.value} value={lvl.value}>
                  {lvl.label}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="primary-button">
            <p>Добавить язык</p>
          </button>
        </form>

        <div className="flex gap-4 mt-8">
          <button type="button" onClick={prevStep} className="secondary-button">
            <p>Назад</p>
          </button>
          <button type="button" onClick={nextStep} className="primary-button flex-1">
            <p>Продолжить</p>
          </button>
        </div>
      </div>
    </div>
  );
}

