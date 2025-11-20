'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useLocalization } from '@/lib/localization';
import LanguageSwitcher from './LanguageSwitcher';
import { LogIn, LogOut, Shield } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const router = useRouter();
  const { user, isAdmin, loading, logout } = useAuth();
  const { t, language, isRTL, fontFamily } = useLocalization();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header
      className="w-full bg-white shadow-md border-b-2 border-primary-200 sticky top-0 z-50"
      style={{ fontFamily, direction: isRTL ? 'rtl' : 'ltr' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Shield className="w-6 h-6 text-primary-600" />
              <span className="text-xl font-bold text-gray-800">{t('app.title')}</span>
            </Link>
          </div>

          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <LanguageSwitcher />
            
            {loading ? (
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            ) : user && isAdmin ? (
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm text-gray-600 hidden md:inline">
                  {language === 'en' ? 'Admin' : language === 'he' ? 'מנהל' : 'مدير'}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700 transition-colors text-sm font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{language === 'en' ? 'Logout' : language === 'he' ? 'התנתק' : 'تسجيل الخروج'}</span>
                </button>
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold"
              >
                <LogIn className="w-4 h-4" />
                <span>{language === 'en' ? 'Admin Login' : language === 'he' ? 'כניסת מנהל' : 'تسجيل دخول المدير'}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

