import { useState } from "react";
import type { FormEvent } from "react";
import { useResumeStore } from "~/lib/resume-store";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

export default function StepRecommendations() {
  const { resumeData, addRecommendation, removeRecommendation, prevStep, initializeResume } =
    useResumeStore();
  const { kv } = usePuterStore();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [contact, setContact] = useState("");

  const recommendations = resumeData.recommendations || [];

  const handleAddRecommendation = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim() || !position.trim() || !contact.trim()) {
      alert("Заполните все поля");
      return;
    }

    addRecommendation({
      name: name.trim(),
      position: position.trim(),
      contact: contact.trim(),
    });

    // Reset form
    setName("");
    setPosition("");
    setContact("");
  };

  const handleFinish = async () => {
    if (!resumeData.title) {
      alert("Пожалуйста, заполните название резюме");
      return;
    }

    // Prepare final resume data
    const finalResume: ResumeData = {
      id: resumeData.id || "",
      title: resumeData.title,
      about: resumeData.about || "",
      aboutRaw: resumeData.aboutRaw || "",
      experiences: resumeData.experiences || [],
      skills: resumeData.skills || [],
      languages: resumeData.languages || [],
      recommendations: resumeData.recommendations || [],
      style: resumeData.style || "modern",
      createdAt: resumeData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // Save to KV store
      await kv.set(`resume:${finalResume.id}`, JSON.stringify(finalResume));
      
      // Navigate to preview
      navigate(`/resume/${finalResume.id}/preview`);
    } catch (error) {
      console.error("Error saving resume:", error);
      alert("Ошибка при сохранении резюме. Попробуйте еще раз.");
    }
  };

  return (
    <div className="wizard-step">
      <h1 className="text-gradient">Рекомендации</h1>
      <h2>Шаг 6: Добавьте рекомендации (необязательно)</h2>
      <p className="text-dark-200 mb-6">
        Если у вас есть рекомендации, добавьте их. Это необязательный шаг.
      </p>

      <div className="w-full max-w-2xl space-y-6">
        {/* Current Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Ваши рекомендации:</h3>
            <div className="space-y-2">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between gradient-border p-4"
                >
                  <div>
                    <p className="font-medium">{rec.name}</p>
                    <p className="text-gray-600">{rec.position}</p>
                    <p className="text-sm text-gray-500">{rec.contact}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRecommendation(rec.id)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Recommendation Form */}
        <form onSubmit={handleAddRecommendation} className="space-y-4">
          <div className="form-div">
            <label htmlFor="rec-name">ФИО *</label>
            <input
              type="text"
              id="rec-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Иван Иванов"
              required
            />
          </div>

          <div className="form-div">
            <label htmlFor="rec-position">Должность *</label>
            <input
              type="text"
              id="rec-position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Team Lead"
              required
            />
          </div>

          <div className="form-div">
            <label htmlFor="rec-contact">Контактные данные *</label>
            <input
              type="text"
              id="rec-contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="email@example.com или +7 (999) 123-45-67"
              required
            />
          </div>

          <button type="submit" className="primary-button">
            <p>Добавить рекомендацию</p>
          </button>
        </form>

        <div className="flex gap-4 mt-8">
          <button type="button" onClick={prevStep} className="secondary-button">
            <p>Назад</p>
          </button>
          <button
            type="button"
            onClick={handleFinish}
            className="primary-button flex-1"
          >
            <p>Завершить и просмотреть</p>
          </button>
        </div>
      </div>
    </div>
  );
}

