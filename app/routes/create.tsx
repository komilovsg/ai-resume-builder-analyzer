import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Navbar from "~/components/Navbar";
import ResumeWizard from "~/components/resume-wizard/ResumeWizard";
import { usePuterStore } from "~/lib/puter";
import { useResumeStore } from "~/lib/resume-store";

export function meta() {
  return [
    { title: "ARBA | Create Resume" },
    { name: "description", content: "Создайте профессиональное резюме с помощью AI" },
  ];
}

export default function Create() {
  const { auth, isLoading, kv } = usePuterStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get("resumeId");
  const { resumeData, initializeResume, hydrateResume, reset } = useResumeStore();
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate(`/auth?next=/create`);
    }
  }, [auth.isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!resumeId) {
      if (!resumeData?.id) {
        initializeResume();
      }
      return;
    }

    let isMounted = true;

    const loadExistingResume = async () => {
      setIsLoadingExisting(true);
      setLoadError(null);
      try {
        const stored = await kv.get(`resume:${resumeId}`);
        if (!stored) {
          if (isMounted) {
            setLoadError("Резюме не найдено или было удалено.");
          }
          return;
        }
        const parsed = JSON.parse(stored) as ResumeData;
        if (isMounted) {
          hydrateResume(parsed);
        }
      } catch (error) {
        console.error("Error loading resume:", error);
        if (isMounted) {
          setLoadError("Не удалось загрузить резюме. Попробуйте позже.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingExisting(false);
        }
      }
    };

    loadExistingResume();

    return () => {
      isMounted = false;
    };
  }, [resumeId, kv, hydrateResume, initializeResume, resumeData?.id]);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        {isLoadingExisting ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <img src="/images/resume-scan-2.gif" className="w-[160px]" alt="loading" />
            <p className="text-gray-600">Загружаем резюме для редактирования...</p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-lg font-semibold text-red-600">{loadError}</p>
            <button
              type="button"
              onClick={() => navigate("/create")}
              className="primary-button w-fit"
            >
              <p>Создать новое резюме</p>
            </button>
          </div>
        ) : (
          <ResumeWizard autoInit={!resumeId} enableStepNavigation={Boolean(resumeId)} />
        )}
      </section>
    </main>
  );
}

