import { useEffect } from "react";
import { useResumeStore } from "~/lib/resume-store";
import StepTitle from "./StepTitle";
import StepAbout from "./StepAbout";
import StepExperience from "./StepExperience";
import StepSkills from "./StepSkills";
import StepLanguages from "./StepLanguages";
import StepRecommendations from "./StepRecommendations";

const steps = [
  { number: 1, title: "Название резюме" },
  { number: 2, title: "О себе" },
  { number: 3, title: "Опыт работы" },
  { number: 4, title: "Навыки" },
  { number: 5, title: "Языки" },
  { number: 6, title: "Рекомендации" },
];

export default function ResumeWizard() {
  const { currentStep, resumeData, initializeResume, reset } = useResumeStore();

  useEffect(() => {
    // Only initialize if resume doesn't have an ID yet
    if (!resumeData?.id) {
      initializeResume();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepTitle />;
      case 2:
        return <StepAbout />;
      case 3:
        return <StepExperience />;
      case 4:
        return <StepSkills />;
      case 5:
        return <StepLanguages />;
      case 6:
        return <StepRecommendations />;
      default:
        return <StepTitle />;
    }
  };

  const handleReset = () => {
    if (confirm("Вы уверены, что хотите сбросить все данные? Это действие нельзя отменить.")) {
      reset();
    }
  };

  return (
    <div className="wizard-container">
      {/* Reset Button */}
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={handleReset}
          className="text-sm text-red-600 hover:text-red-800 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
          title="Сбросить все данные"
        >
          🔄 Сбросить
        </button>
      </div>

      {/* Progress Bar */}
      <div className="wizard-progress">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`wizard-step-indicator ${
              step.number === currentStep
                ? "active"
                : step.number < currentStep
                ? "completed"
                : ""
            }`}
          >
            <div className="wizard-step-number">{step.number}</div>
            <div className="wizard-step-title">{step.title}</div>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="wizard-content">{renderStep()}</div>
    </div>
  );
}

