'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useLocalization } from '@/lib/localization';
import { useTheme } from '@/lib/theme';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
      className="w-full bg-white dark:bg-dark-bg-secondary shadow-lg border-b-2 border-primary-200 dark:border-dark-border sticky top-0 z-50 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90"
      style={{ fontFamily, direction: isRTL ? 'rtl' : 'ltr' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image
                src="/logo.png"
                alt="Fake News Logo"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
                priority
              />
              <span className="text-xl font-bold text-gray-800 dark:text-dark-text-primary">FakeNews</span>
            </Link>
          </div>

          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <ThemeToggle />
            <LanguageSwitcher />
            
            {loading ? (
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            ) : user && isAdmin ? (
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm text-gray-600 dark:text-dark-text-secondary hidden md:inline">
                  {language === 'en' ? 'Admin' : language === 'he' ? 'מנהל' : 'مدير'}
                </span>
                <Link
                  href="/admin/dashboard"
                  className="flex items-center justify-center w-10 h-10 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  title={language === 'en' ? 'Dashboard' : language === 'he' ? 'לוח בקרה' : 'لوحة التحكم'}
                >
                  <LayoutDashboard className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-10 h-10 bg-danger-600 text-white rounded-lg hover:bg-danger-700 transition-colors"
                  title={language === 'en' ? 'Logout' : language === 'he' ? 'התנתק' : 'تسجيل الخروج'}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="flex items-center justify-center w-10 h-10 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                title={language === 'en' ? 'Admin Login' : language === 'he' ? 'כניסת מנהל' : 'تسجيل دخول المدير'}
              >
                <LogIn className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

