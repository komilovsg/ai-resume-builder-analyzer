import { useState } from "react";
import type { FormEvent } from "react";
import { useResumeStore } from "~/lib/resume-store";
import { generateAboutText } from "~/lib/resume-ai";

export default function StepAbout() {
  const { resumeData, setAbout, setAboutRaw, nextStep, prevStep, setGenerating, setGenerationError, isGenerating } =
    useResumeStore();
  const [rawText, setRawText] = useState(resumeData.aboutRaw || "");
  const [generatedText, setGeneratedText] = useState(resumeData.about || "");

  const handleGenerate = async () => {
    if (!rawText.trim()) {
      alert("Пожалуйста, сначала введите информацию о себе");
      return;
    }

    if (!resumeData.title) {
      alert("Пожалуйста, сначала укажите название резюме");
      return;
    }

    setGenerating(true);
    setGenerationError(null);

    try {
      const generated = await generateAboutText(rawText, resumeData.title);
      setGeneratedText(generated);
      setAbout(generated);
      setAboutRaw(rawText);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ошибка генерации текста";
      setGenerationError(errorMessage);
      alert(`Ошибка: ${errorMessage}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (generatedText.trim() || rawText.trim()) {
      setAbout(generatedText || rawText);
      setAboutRaw(rawText);
      nextStep();
    }
  };

  return (
    <div className="wizard-step">
      <h1 className="text-gradient">О себе</h1>
      <h2>Шаг 2: Расскажите о себе</h2>
      <p className="text-dark-200 mb-6">
        Введите информацию о себе, и мы поможем создать профессиональный текст
        для резюме
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="form-div">
          <label htmlFor="about-raw">Информация о себе</label>
          <textarea
            id="about-raw"
            rows={6}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Например: Работаю фронтенд-разработчиком 5 лет. Специализируюсь на React и TypeScript. Участвовал в разработке крупных проектов..."
            className="w-full"
          />
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={!rawText.trim() || isGenerating}
          className={`primary-button mt-4 ${!rawText.trim() || isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <p>{isGenerating ? "Генерация..." : "Сгенерировать с помощью AI"}</p>
        </button>

        {generatedText && (
          <div className="form-div mt-6">
            <label htmlFor="about-generated">Сгенерированный текст</label>
            <textarea
              id="about-generated"
              rows={4}
              value={generatedText}
              onChange={(e) => setGeneratedText(e.target.value)}
              className="w-full"
              placeholder="Здесь появится сгенерированный текст..."
            />
            <p className="text-sm text-gray-500 mt-2">
              Вы можете редактировать сгенерированный текст при необходимости
            </p>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={prevStep}
            className="secondary-button"
          >
            <p>Назад</p>
          </button>
          <button type="submit" className="primary-button flex-1">
            <p>Продолжить</p>
          </button>
        </div>
      </form>
    </div>
  );
}

