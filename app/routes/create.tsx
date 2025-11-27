import { useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import ResumeWizard from "~/components/resume-wizard/ResumeWizard";
import { usePuterStore } from "~/lib/puter";
import { useResumeStore } from "~/lib/resume-store";

export function meta() {
  return [
    { title: "Resumind | Создать резюме" },
    { name: "description", content: "Создайте профессиональное резюме с помощью AI" },
  ];
}

export default function Create() {
  const { auth, isLoading } = usePuterStore();
  const navigate = useNavigate();
  const { reset } = useResumeStore();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate(`/auth?next=/create`);
    }
  }, [auth.isAuthenticated, isLoading, navigate]);

  // Don't reset on mount - keep saved state from localStorage
  // User can manually reset using the reset button in wizard

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <ResumeWizard />
      </section>
    </main>
  );
}

