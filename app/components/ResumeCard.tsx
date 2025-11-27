import type { MouseEvent } from "react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import ScoreCircle from "./ScoreCircle";
import { usePuterStore } from "~/lib/puter";

interface ResumeCardProps {
  resume: Resume & { storageKey: string };
  onDelete: (storageKey: string) => void;
  isDeleting: boolean;
}

const ResumeCard = ({
  resume,
  onDelete,
  isDeleting,
}: ResumeCardProps) => {
  const { id, companyName, jobTitle, feedback, imagePath, storageKey } = resume;
  const { fs } = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState("");

  useEffect(() => {
    const loadResumes = async () => {
      const blob = await fs.read(imagePath);
      if (!blob) return;
      let url = URL.createObjectURL(blob);
      setResumeUrl(url);
    };

    loadResumes();
  }, [imagePath]);

  const handleDeleteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onDelete(storageKey);
  };

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={handleDeleteClick}
        disabled={isDeleting}
        title="Удалить резюме"
        className="absolute -top-3 -right-3 z-10 rounded-full bg-white/90 border border-red-200 text-red-600 shadow-lg p-2 hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto"
      >
        {isDeleting ? (
          <span className="block w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
        ) : (
          <span aria-hidden="true">✕</span>
        )}
      </button>
      <Link
        to={`/resume/${id}`}
        className={`resume-card animate-in fade-in duration-700 ${
          isDeleting ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <div className="resume-card-header">
          <div className="flex flex-col gap-2">
            {companyName && (
              <h2 className="!text-base font-bold  break-words">
                {companyName}
              </h2>
            )}
            {jobTitle && (
              <h3 className="text-lg text-gray-500 break-words">{jobTitle}</h3>
            )}
            {!companyName && !jobTitle && (
              <h2 className="!text-black font-bold">Resume</h2>
            )}
          </div>
          <div className="flex-shrink-0">
            {feedback && feedback.overallScore !== undefined ? (
              <ScoreCircle score={feedback.overallScore} />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-sm text-gray-500">N/A</span>
              </div>
            )}
          </div>
        </div>
        {resumeUrl && (
          <div className="gradient-border animate-in fade-in duration-1000">
            <div className="w-full h-full">
              <img
                src={resumeUrl}
                alt="resume"
                className="w-full h-[350px]  max-sm:h-[200px] object-cover object-top"
              />
            </div>
          </div>
        )}
      </Link>
    </div>
  );
};

export default ResumeCard;
