import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { usePuterStore } from "~/lib/puter";
import ResumePreview from "~/components/resume-preview/ResumePreview";

export function meta() {
  return [
    { title: "Resumind | Предпросмотр резюме" },
    { name: "description", content: "Предпросмотр вашего резюме" },
  ];
}

export default function ResumePreviewPage() {
  const { auth, isLoading, kv } = usePuterStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate(`/auth?next=/resume/${id}/preview`);
    }
  }, [auth.isAuthenticated, isLoading, navigate, id]);

  useEffect(() => {
    const loadResume = async () => {
      if (!id) return;

      try {
        const resume = await kv.get(`resume:${id}`);
        if (!resume) {
          alert("Резюме не найдено");
          navigate("/");
          return;
        }

        const data = JSON.parse(resume) as ResumeData;
        setResumeData(data);
      } catch (error) {
        console.error("Error loading resume:", error);
        alert("Ошибка при загрузке резюме");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    if (auth.isAuthenticated) {
      loadResume();
    }
  }, [id, auth.isAuthenticated, kv, navigate]);

  if (loading) {
    return (
      <main className="!pt-0">
        <div className="flex items-center justify-center min-h-screen">
          <img
            src="/images/resume-scan-2.gif"
            className="w-[200px]"
            alt="loading"
          />
        </div>
      </main>
    );
  }

  if (!resumeData) {
    return null;
  }

  return (
    <main className="!pt-0">
      <nav className="resume-nav">
        <Link to="/" className="back-button">
          <img src="/icons/back.svg" alt="back" className="w-2.5 h-2.5" />
          <span className="text-gray-800 text-sm font-semibold">
            Назад на главную
          </span>
        </Link>
      </nav>
      <div className="flex flex-col items-center py-8">
        <ResumePreview resumeData={resumeData} />
      </div>
    </main>
  );
}

