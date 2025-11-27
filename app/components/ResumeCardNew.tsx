import { Link } from "react-router";

interface ResumeCardNewProps {
  resume: ResumeData;
}

export default function ResumeCardNew({ resume }: ResumeCardNewProps) {
  return (
    <Link
      to={`/resume/${resume.id}/preview`}
      className="resume-card animate-in fade-in duration-700"
    >
      <div className="resume-card-header">
        <div className="flex flex-col gap-2">
          <h2 className="!text-base font-bold break-words">{resume.title}</h2>
          {resume.about && (
            <p className="text-sm text-gray-500 line-clamp-2">
              {resume.about.substring(0, 100)}...
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-2xl">📄</span>
          </div>
        </div>
      </div>
      <div className="gradient-border p-4">
        <div className="space-y-2 text-sm">
          {resume.experiences && resume.experiences.length > 0 && (
            <div>
              <span className="font-semibold">Опыт: </span>
              <span>{resume.experiences.length} {resume.experiences.length === 1 ? "место" : "мест"}</span>
            </div>
          )}
          {resume.skills && resume.skills.length > 0 && (
            <div>
              <span className="font-semibold">Навыки: </span>
              <span>{resume.skills.length}</span>
            </div>
          )}
          {resume.languages && resume.languages.length > 0 && (
            <div>
              <span className="font-semibold">Языки: </span>
              <span>{resume.languages.length}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

