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

interface ResumeWizardProps {
  autoInit?: boolean;
  enableStepNavigation?: boolean;
}

export default function ResumeWizard({
  autoInit = true,
  enableStepNavigation = false,
}: ResumeWizardProps) {
  const { currentStep, resumeData, initializeResume, reset, setCurrentStep } = useResumeStore();

  useEffect(() => {
    if (!autoInit) return;
    if (!resumeData?.id) {
      initializeResume();
    }
  }, [autoInit, resumeData?.id, initializeResume]);

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

  const handleStepClick = (stepNumber: number) => {
    if (!enableStepNavigation || stepNumber === currentStep) return;
    setCurrentStep(stepNumber);
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
          <button
            key={step.number}
            type="button"
            className={`wizard-step-indicator ${
              step.number === currentStep
                ? "active"
                : step.number < currentStep
                ? "completed"
                : ""
            } ${enableStepNavigation ? "cursor-pointer" : "cursor-default"}`}
            onClick={() => handleStepClick(step.number)}
            disabled={!enableStepNavigation}
          >
            <div className="wizard-step-number">{step.number}</div>
            <div className="wizard-step-title">{step.title}</div>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="wizard-content">{renderStep()}</div>
    </div>
  );
}

