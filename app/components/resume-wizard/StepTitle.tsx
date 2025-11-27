import { useState } from "react";
import type { FormEvent } from "react";
import { useResumeStore } from "~/lib/resume-store";

export default function StepTitle() {
  const { resumeData, setTitle, setPersonalInfo, nextStep } = useResumeStore();
  const [fullName, setFullName] = useState(resumeData.fullName || "");
  const [title, setTitleLocal] = useState(resumeData.title || "");
  const [location, setLocation] = useState(resumeData.location || "");
  const [email, setEmail] = useState(resumeData.email || "");
  const [phone, setPhone] = useState(resumeData.phone || "");
  const [linkedin, setLinkedin] = useState(resumeData.linkedin || "");
  const [telegram, setTelegram] = useState(resumeData.telegram || "");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedFullName = fullName.trim();
    const trimmedTitle = title.trim();
    const trimmedLocation = location.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedLinkedin = linkedin.trim();
    const trimmedTelegram = telegram.trim();

    if (!trimmedFullName || !trimmedTitle) {
      return;
    }

    if (!trimmedEmail || !trimmedPhone) {
      alert("Укажите как минимум email и телефон, чтобы работодатели могли связаться с вами.");
      return;
    }

    setTitle(trimmedTitle);
    setPersonalInfo({
      fullName: trimmedFullName,
      location: trimmedLocation,
      email: trimmedEmail,
      phone: trimmedPhone,
      linkedin: trimmedLinkedin,
      telegram: trimmedTelegram,
    });
    nextStep();
  };

  return (
    <div className="wizard-step">
      <h1 className="text-gradient">Создание резюме</h1>
      <h2>Шаг 1: Личные данные и контакты</h2>
      <p className="text-dark-200 mb-6">
        Укажите целевую должность и контактные данные, чтобы рекрутеры могли связаться с вами
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="form-div">
          <label htmlFor="resume-fullname">ФИО *</label>
          <input
            type="text"
            id="resume-fullname"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Иван Иванов"
            required
            className="w-full"
          />
        </div>

        <div className="form-div">
          <label htmlFor="resume-title">Название резюме / Профессия *</label>
          <input
            type="text"
            id="resume-title"
            value={title}
            onChange={(e) => setTitleLocal(e.target.value)}
            placeholder="Frontend Developer"
            required
            className="w-full"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="form-div">
            <label htmlFor="resume-location">Город / Страна</label>
            <input
              type="text"
              id="resume-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ташкент, Узбекистан"
            />
          </div>

          <div className="form-div">
            <label htmlFor="resume-email">Email *</label>
            <input
              type="email"
              id="resume-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-div">
            <label htmlFor="resume-phone">Телефон *</label>
            <input
              type="tel"
              id="resume-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 999 123-45-67"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="form-div">
            <label htmlFor="resume-linkedin">LinkedIn</label>
            <input
              type="url"
              id="resume-linkedin"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://www.linkedin.com/in/username"
            />
          </div>

          <div className="form-div">
            <label htmlFor="resume-telegram">Telegram</label>
            <input
              type="text"
              id="resume-telegram"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="@username или https://t.me/username"
            />
          </div>
        </div>

        <button type="submit" className="primary-button mt-8">
          <p>Продолжить</p>
        </button>
      </form>
    </div>
  );
}

