'use client';

import React from 'react';
import { useLocalization } from '@/lib/localization';
import { Globe } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { Language } from '@/types/game';

export default function LanguageSwitcher() {
  const { language, setLanguage, isRTL } = useLocalization();
  const { isDark } = useTheme();

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'he', label: 'עברית' },
    { code: 'ar', label: 'العربية' },
  ];

  return (
    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
      <Globe className={`w-5 h-5 text-primary-600 dark:text-primary-400`} />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="px-3 py-2 rounded-lg border-2 border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg-tertiary text-primary-900 dark:text-dark-text-primary font-medium focus:outline-none focus:border-primary-500 dark:focus:border-primary-400 cursor-pointer"
        style={{ fontFamily: 'inherit' }}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}

