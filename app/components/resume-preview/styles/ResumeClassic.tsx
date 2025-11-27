interface ResumeClassicProps {
  resumeData: ResumeData;
}

export default function ResumeClassic({ resumeData }: ResumeClassicProps) {
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
    <div className="resume-classic">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4 uppercase tracking-wide">
          {resumeData.title}
        </h1>
        {resumeData.about && (
          <div className="border-t-2 border-b-2 border-gray-900 py-4">
            <p className="text-gray-700 text-base leading-relaxed">
              {resumeData.about}
            </p>
          </div>
        )}
      </header>

      {/* Experience */}
      {resumeData.experiences && resumeData.experiences.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase tracking-wide border-b-2 border-gray-900 pb-2">
            Опыт работы
          </h2>
          <div className="space-y-6">
            {resumeData.experiences.map((exp) => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between items-baseline mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 uppercase">
                      {exp.position}
                    </h3>
                    <p className="text-lg text-gray-700 font-semibold">
                      {exp.company}
                    </p>
                  </div>
                  <span className="text-gray-600 font-medium">
                    {formatDate(exp.period.start)} - {formatDate(exp.period.end)}
                  </span>
                </div>
                {exp.description && (
                  <div className="text-gray-700 whitespace-pre-line mt-2 pl-4 border-l-2 border-gray-400">
                    {exp.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {resumeData.skills && resumeData.skills.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase tracking-wide border-b-2 border-gray-900 pb-2">
            Навыки
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {resumeData.skills.map((skill, index) => (
              <div
                key={index}
                className="text-gray-700 border-b border-gray-300 pb-1"
              >
                • {skill}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {resumeData.languages && resumeData.languages.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase tracking-wide border-b-2 border-gray-900 pb-2">
            Языки
          </h2>
          <div className="space-y-2">
            {resumeData.languages.map((lang) => (
              <div key={lang.id} className="flex justify-between border-b border-gray-300 pb-1">
                <span className="font-semibold text-gray-900">{lang.name}</span>
                <span className="text-gray-600 italic">
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
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase tracking-wide border-b-2 border-gray-900 pb-2">
              Рекомендации
            </h2>
            <div className="space-y-4">
              {resumeData.recommendations.map((rec) => (
                <div key={rec.id} className="border-l-4 border-gray-900 pl-4">
                  <p className="font-bold text-gray-900 uppercase">{rec.name}</p>
                  <p className="text-gray-700 font-semibold">{rec.position}</p>
                  <p className="text-sm text-gray-600">{rec.contact}</p>
                </div>
              ))}
            </div>
          </section>
        )}
    </div>
  );
}

