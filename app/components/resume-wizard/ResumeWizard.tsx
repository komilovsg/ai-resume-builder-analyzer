import { useEffect } from "react";
import { useResumeStore } from "~/lib/resume-store";
import StepTitle from "./StepTitle";
import StepAbout from "./StepAbout";
import StepExperience from "./StepExperience";
import StepSkills from "./StepSkills";
import StepLanguages from "./StepLanguages";
import StepRecommendations from "./StepRecommendations";
import { useTranslation } from "react-i18next";

interface ResumeWizardProps {
  autoInit?: boolean;
  enableStepNavigation?: boolean;
}

export default function ResumeWizard({
  autoInit = true,
  enableStepNavigation = false,
}: ResumeWizardProps) {
  const { currentStep, resumeData, initializeResume, reset, setCurrentStep } = useResumeStore();
  const { t } = useTranslation();
  
  const steps = [
    { number: 1, title: t('wizard.steps.step1') },
    { number: 2, title: t('wizard.steps.step2') },
    { number: 3, title: t('wizard.steps.step3') },
    { number: 4, title: t('wizard.steps.step4') },
    { number: 5, title: t('wizard.steps.step5') },
    { number: 6, title: t('wizard.steps.step6') },
  ];

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

  const handleStepClick = (stepNumber: number) => {
    if (!enableStepNavigation || stepNumber === currentStep) return;
    setCurrentStep(stepNumber);
  };

  return (
    <div className="wizard-container">
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

