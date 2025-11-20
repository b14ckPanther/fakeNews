'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '@/types/game';

interface LocalizationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
  fontFamily: string;
}

const translations: Record<string, Record<Language, string>> = {
  // Navigation
  'app.title': {
    en: 'Fake News Seminar',
    he: 'סמינר פייק ניוז',
    ar: 'ندوة الأخبار المزيفة',
  },
  'home.join': {
    en: 'Join Game',
    he: 'הצטרף למשחק',
    ar: 'انضم إلى اللعبة',
  },
  'home.create': {
    en: 'Create Game',
    he: 'צור משחק',
    ar: 'إنشاء لعبة',
  },
  'player.enterPin': {
    en: 'Enter Game PIN',
    he: 'הזן PIN של המשחק',
    ar: 'أدخل رمز اللعبة',
  },
  'player.enterName': {
    en: 'Enter Your Name',
    he: 'הזן את שמך',
    ar: 'أدخل اسمك',
  },
  'lobby.waiting': {
    en: 'Waiting for game to start...',
    he: 'ממתין למשחק להתחיל...',
    ar: 'في انتظار بدء اللعبة...',
  },
  'lobby.players': {
    en: 'Players',
    he: 'שחקנים',
    ar: 'اللاعبون',
  },
  'admin.startGame': {
    en: 'Start Game',
    he: 'התחל משחק',
    ar: 'ابدأ اللعبة',
  },
  'admin.nextRound': {
    en: 'Next Round',
    he: 'סיבוב הבא',
    ar: 'الجولة التالية',
  },
  'round.skip': {
    en: 'Skip',
    he: 'דלג',
    ar: 'تخطي',
  },
  'round.fake': {
    en: 'Fake',
    he: 'שקר',
    ar: 'مزيف',
  },
  'round.true': {
    en: 'True',
    he: 'אמת',
    ar: 'صحيح',
  },
  'results.title': {
    en: 'Final Results',
    he: 'תוצאות סופיות',
    ar: 'النتائج النهائية',
  },
  'results.yourScore': {
    en: 'Your Score',
    he: 'הניקוד שלך',
    ar: 'نقاطك',
  },
  'results.category': {
    en: 'Category',
    he: 'קטגוריה',
    ar: 'الفئة',
  },
  'category.victim': {
    en: 'Victim',
    he: 'קורבן',
    ar: 'ضحية',
  },
  'category.truthExplorer': {
    en: 'Truth Explorer',
    he: 'חוקר אמת',
    ar: 'مستكشف الحقيقة',
  },
  'category.truthexplorer': {
    en: 'Truth Explorer',
    he: 'חוקר אמת',
    ar: 'مستكشف الحقيقة',
  },
  'category.lieInvestigator': {
    en: 'Lie Investigator',
    he: 'חוקר שקרים',
    ar: 'محقق الأكاذيب',
  },
  'category.lieinvestigator': {
    en: 'Lie Investigator',
    he: 'חוקר שקרים',
    ar: 'محقق الأكاذيب',
  },
  'category.lieHunter': {
    en: 'Lie Hunter',
    he: 'צייד שקרים',
    ar: 'صياد الأكاذيب',
  },
  'category.liehunter': {
    en: 'Lie Hunter',
    he: 'צייד שקרים',
    ar: 'صياد الأكاذيب',
  },
  'admin.results': {
    en: 'Game Results',
    he: 'תוצאות המשחק',
    ar: 'نتائج اللعبة',
  },
  'admin.summary': {
    en: 'Summary',
    he: 'סיכום',
    ar: 'ملخص',
  },
};

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export function LocalizationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('language') as Language;
    if (saved && ['en', 'he', 'ar'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const isRTL = language === 'he' || language === 'ar';
  const fontFamily = language === 'en' ? 'Ubuntu' : language === 'he' ? 'Heebo' : 'Cairo';

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <LocalizationContext.Provider value={{ language: 'en', setLanguage, t, isRTL: false, fontFamily: 'Ubuntu' }}>
        {children}
      </LocalizationContext.Provider>
    );
  }

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t, isRTL, fontFamily }}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }
  return context;
}

