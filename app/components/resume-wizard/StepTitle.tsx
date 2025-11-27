import { useState } from "react";
import type { FormEvent } from "react";
import { useResumeStore } from "~/lib/resume-store";

export default function StepTitle() {
  const { resumeData, setTitle, nextStep } = useResumeStore();
  const [title, setTitleLocal] = useState(resumeData.title || "");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (title.trim()) {
      setTitle(title.trim());
      nextStep();
    }
  };

  return (
    <div className="wizard-step">
      <h1 className="text-gradient">Создание резюме</h1>
      <h2>Шаг 1: Введите название резюме (профессию)</h2>
      <p className="text-dark-200 mb-6">
        Например: "Frontend Developer", "UI/UX Designer", "Product Manager"
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="form-div">
          <label htmlFor="resume-title">Название резюме / Профессия</label>
          <input
            type="text"
            id="resume-title"
            value={title}
            onChange={(e) => setTitleLocal(e.target.value)}
            placeholder="Frontend Developer"
            required
            className="w-full"
          />
        </div>

        <button type="submit" className="primary-button mt-8">
          <p>Продолжить</p>
        </button>
      </form>
    </div>
  );
}

