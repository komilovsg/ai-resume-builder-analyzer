interface ResumeMinimalProps {
  resumeData: ResumeData;
}

export default function ResumeMinimal({ resumeData }: ResumeMinimalProps) {
  const formatDate = (date: string | null) => {
    if (!date) return "По настоящее время";
    const [year, month] = date.split("-");
    return `${month}/${year}`;
  };

  const getLanguageLabel = (level: LanguageLevel) => {
    const labels: Record<LanguageLevel, string> = {
      native: "Родной",
      fluent: "Свободно",
      intermediate: "Средний",
      basic: "Базовый",
    };
    return labels[level];
  };

  return (
    <div className="resume-minimal">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-3xl font-light text-gray-900 mb-3">
          {resumeData.title}
        </h1>
        {resumeData.about && (
          <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
            {resumeData.about}
          </p>
        )}
      </header>

      {/* Experience */}
      {resumeData.experiences && resumeData.experiences.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-normal text-gray-500 uppercase tracking-widest mb-6">
            Опыт работы
          </h2>
          <div className="space-y-8">
            {resumeData.experiences.map((exp) => (
              <div key={exp.id} className="flex gap-8">
                <div className="w-24 text-xs text-gray-400 flex-shrink-0">
                  {formatDate(exp.period.start)} - {formatDate(exp.period.end)}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-normal text-gray-900 mb-1">
                    {exp.position}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">{exp.company}</p>
                  {exp.description && (
                    <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                      {exp.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {resumeData.skills && resumeData.skills.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-normal text-gray-500 uppercase tracking-widest mb-6">
            Навыки
          </h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {resumeData.skills.map((skill, index) => (
              <span key={index} className="text-sm text-gray-700">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {resumeData.languages && resumeData.languages.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-normal text-gray-500 uppercase tracking-widest mb-6">
            Языки
          </h2>
          <div className="space-y-2">
            {resumeData.languages.map((lang) => (
              <div key={lang.id} className="flex gap-4 text-sm">
                <span className="text-gray-900 w-32">{lang.name}</span>
                <span className="text-gray-500">
                  {getLanguageLabel(lang.level)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommendations */}
      {resumeData.recommendations &&
        resumeData.recommendations.length > 0 && (
          <section className="mb-10">
            <h2 className="text-sm font-normal text-gray-500 uppercase tracking-widest mb-6">
              Рекомендации
            </h2>
            <div className="space-y-4">
              {resumeData.recommendations.map((rec) => (
                <div key={rec.id} className="text-sm">
                  <p className="text-gray-900">{rec.name}</p>
                  <p className="text-gray-500">{rec.position}</p>
                  <p className="text-gray-400 text-xs">{rec.contact}</p>
                </div>
              ))}
            </div>
          </section>
        )}
    </div>
  );
}

