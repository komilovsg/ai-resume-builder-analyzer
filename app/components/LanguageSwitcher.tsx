import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);

  const changeLanguage = async (lng: string) => {
    if (i18n.language === lng || isChanging) return;
    
    setIsChanging(true);
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
    
    // Плавное завершение анимации
    setTimeout(() => {
      setIsChanging(false);
    }, 300);
  };

  const currentLanguage = i18n.language || 'en';

  return (
    <div className={`language-switcher ${isChanging ? 'language-switcher--changing' : ''}`}>
      <button
        onClick={() => changeLanguage('en')}
        className={`language-switcher__button ${currentLanguage === 'en' ? 'active' : ''}`}
        aria-label="Switch to English"
        disabled={isChanging}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('ru')}
        className={`language-switcher__button ${currentLanguage === 'ru' ? 'active' : ''}`}
        aria-label="Switch to Russian"
        disabled={isChanging}
      >
        RU
      </button>
    </div>
  );
};

export default LanguageSwitcher;

