'use client';

import React from 'react';
import { useLocalization } from '@/lib/localization';
import { Globe } from 'lucide-react';
import { Language } from '@/types/game';

export default function LanguageSwitcher() {
  const { language, setLanguage, isRTL } = useLocalization();

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'he', label: 'עברית' },
    { code: 'ar', label: 'العربية' },
  ];

  return (
    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
      <Globe className="w-5 h-5 text-primary-600" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="px-3 py-2 rounded-lg border-2 border-primary-200 bg-white text-primary-900 font-medium focus:outline-none focus:border-primary-500 cursor-pointer"
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

