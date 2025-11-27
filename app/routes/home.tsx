import type { Route } from "./+types/home";
import Navbar from "../components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import ResumeCardNew from "~/components/ResumeCardNew";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream resume!" },
  ];
}

// Helper function to check if resume is old format (with feedback) or new format (ResumeData)
const isOldResume = (resume: any): resume is Resume => {
  return resume.feedback !== undefined && resume.imagePath !== undefined;
};

const isNewResume = (resume: any): resume is ResumeData => {
  return resume.title !== undefined && resume.about !== undefined;
};

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [oldResumes, setOldResumes] = useState<Resume[]>([]);
  const [newResumes, setNewResumes] = useState<ResumeData[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) navigate("/auth?next=/");
  }, [auth.isAuthenticated, navigate]);

  useEffect(() => {
    const loadResumes = async () => {
      if (!auth.isAuthenticated) return;
      
      setLoadingResumes(true);

      try {
        const resumes = (await kv.list("resume:*", true)) as KVItem[];

        const old: Resume[] = [];
        const new_: ResumeData[] = [];

        resumes?.forEach((item) => {
          try {
            const parsed = JSON.parse(item.value);
            if (isOldResume(parsed)) {
              old.push(parsed);
            } else if (isNewResume(parsed)) {
              new_.push(parsed);
            }
          } catch (error) {
            console.error("Error parsing resume:", error);
          }
        });

        setOldResumes(old);
        setNewResumes(new_);
      } catch (error) {
        console.error("Error loading resumes:", error);
      } finally {
        setLoadingResumes(false);
      }
    };

    if (auth.isAuthenticated) {
      loadResumes();
    }
  }, [auth.isAuthenticated, kv]);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Мои резюме</h1>
          {!loadingResumes && oldResumes.length === 0 && newResumes.length === 0 ? (
            <h2>Резюме не найдено. Создайте или загрузите первое резюме</h2>
          ) : (
            <h2>Просмотрите ваши резюме и созданные шаблоны</h2>
          )}
        </div>
        {loadingResumes && (
          <div>
            <img
              src="/images/resume-scan-2.gif"
              className="w-[200px]"
              alt="resume"
            />
          </div>
        )}

        {!loadingResumes && (oldResumes.length > 0 || newResumes.length > 0) && (
          <>
            {oldResumes.length > 0 && (
              <div className="w-full max-w-6xl">
                <h2 className="text-2xl font-bold mb-4">Проанализированные резюме</h2>
                <div className="resumes-section">
                  {oldResumes.map((resume) => (
                    <ResumeCard key={resume.id} resume={resume} />
                  ))}
                </div>
              </div>
            )}

            {newResumes.length > 0 && (
              <div className="w-full max-w-6xl mt-8">
                <h2 className="text-2xl font-bold mb-4">Созданные резюме</h2>
                <div className="resumes-section">
                  {newResumes.map((resume) => (
                    <ResumeCardNew key={resume.id} resume={resume} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!loadingResumes && oldResumes.length === 0 && newResumes.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link
              to="/create"
              className="primary-button w-fit text-xl font-semibold"
            >
              Создать резюме
            </Link>
            <Link
              to="/upload"
              className="secondary-button w-fit text-xl font-semibold"
            >
              Загрузить резюме для анализа
            </Link>
          </div>
        )}

        {!loadingResumes && (oldResumes.length > 0 || newResumes.length > 0) && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link
              to="/create"
              className="primary-button w-fit text-xl font-semibold"
            >
              Создать новое резюме
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
