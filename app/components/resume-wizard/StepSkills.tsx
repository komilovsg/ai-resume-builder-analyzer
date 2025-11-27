import { useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { useResumeStore } from "~/lib/resume-store";
import { generateSuggestedSkills } from "~/lib/resume-ai";

export default function StepSkills() {
  const { resumeData, addSkill, removeSkill, nextStep, prevStep, setGenerating, isGenerating } =
    useResumeStore();
  const [newSkill, setNewSkill] = useState("");
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const skills = resumeData.skills || [];

  const handleLoadSuggestions = async () => {
    if (!resumeData.title) {
      alert("Сначала укажите название резюме");
      return;
    }

    setGenerating(true);
    setShowSuggestions(true);

    try {
      const suggestions = await generateSuggestedSkills(resumeData.title);
      setSuggestedSkills(suggestions);
    } catch (error) {
      console.error("Error loading suggestions:", error);
      alert("Не удалось загрузить предложения. Вы можете добавить навыки вручную.");
    } finally {
      setGenerating(false);
    }
  };

  const handleAddSkill = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newSkill.trim()) {
      const skillsToAdd = newSkill
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      skillsToAdd.forEach((skill) => {
        if (skill && !skills.includes(skill)) {
          addSkill(skill);
        }
      });

      setNewSkill("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newSkill.trim()) {
      e.preventDefault();
      const form = e.currentTarget.closest("form");
      if (form) {
        const formEvent = new Event("submit", { bubbles: true, cancelable: true }) as unknown as FormEvent<HTMLFormElement>;
        Object.defineProperty(formEvent, "currentTarget", { value: form, enumerable: true });
        Object.defineProperty(formEvent, "target", { value: form, enumerable: true });
        handleAddSkill(formEvent);
      }
    }
  };

  const handleAddSuggestedSkill = (skill: string) => {
    if (!skills.includes(skill)) {
      addSkill(skill);
    }
  };

  return (
    <div className="wizard-step">
      <h1 className="text-gradient">Навыки</h1>
      <h2>Шаг 4: Добавьте навыки</h2>
      <p className="text-dark-200 mb-6">
        Добавьте навыки, которые у вас есть. Можно использовать AI-предложения
        или добавить вручную.
      </p>

      <div className="w-full max-w-2xl space-y-6">
        {!showSuggestions && (
          <button
            type="button"
            onClick={handleLoadSuggestions}
            disabled={isGenerating || !resumeData.title}
            className="primary-button"
          >
            <p>
              {isGenerating
                ? "Загрузка предложений..."
                : "Получить предложения от AI"}
            </p>
          </button>
        )}

        {showSuggestions && suggestedSkills.length > 0 && (
          <div className="gradient-border p-4">
            <h3 className="font-semibold mb-3">Предложенные навыки:</h3>
            <div className="flex flex-wrap gap-2">
              {suggestedSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleAddSuggestedSkill(skill)}
                  disabled={skills.includes(skill)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    skills.includes(skill)
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                >
                  {skill} {skills.includes(skill) && "✓"}
                </button>
              ))}
            </div>
          </div>
        )}

        {skills.length > 0 && (
          <div className="gradient-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Ваши навыки</h3>
              <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
                {skills.length} {skills.length === 1 ? "навык" : skills.length < 5 ? "навыка" : "навыков"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <span className="text-gray-800 font-medium">{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1 transition-colors"
                    title="Удалить навык"
                  >
                    <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="gradient-border p-6">
          <h3 className="font-semibold mb-4 text-lg">Добавить навык вручную</h3>
          <form onSubmit={handleAddSkill} className="space-y-3">
            <div className="form-div">
              <label htmlFor="new-skill" className="text-sm text-gray-600 mb-2">
                Введите навык или несколько навыков через запятую
              </label>
              <div className="flex gap-1 justify-center items-center">
                <div className="w-[70%]">
                  <input
                    type="text"
                    id="new-skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Например: React, TypeScript, Figma или просто React"
                    className="w-full"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newSkill.trim()}
                  className={`primary-button px-8 whitespace-nowrap w-[30%] flex items-center justify-center ${
                    !newSkill.trim() ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <p>Добавить</p>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Можно ввести несколько навыков через запятую или нажать Enter для добавления
              </p>
            </div>
          </form>
        </div>

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
