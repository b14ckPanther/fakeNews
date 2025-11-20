'use client';

import React from 'react';
import { useLocalization } from '@/lib/localization';
import { Globe } from 'lucide-react';
import { Language } from '@/types/game';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLocalization();

  const languages: Language[] = ['en', 'he', 'ar'];
  const languageLabels: Record<Language, string> = {
    en: 'English',
    he: 'עברית',
    ar: 'العربية',
  };

  const handleClick = () => {
    const currentIndex = languages.indexOf(language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex]);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-primary-50 dark:hover:bg-dark-bg-tertiary transition-colors"
      title={languageLabels[language]}
      aria-label={`Switch language. Current: ${languageLabels[language]}`}
    >
      <Globe className="w-5 h-5 text-primary-600 dark:text-primary-400" />
    </button>
  );
}

