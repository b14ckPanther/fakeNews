'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useLocalization } from '@/lib/localization';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Shield, LogIn, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const { t, language, isRTL, fontFamily } = useLocalization();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(
        err.message || 
        (language === 'en' 
          ? 'Invalid email or password' 
          : language === 'he' 
          ? 'אימייל או סיסמה שגויים' 
          : 'البريد الإلكتروني أو كلمة المرور غير صحيحة')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-danger-50"
      style={{ fontFamily, direction: isRTL ? 'rtl' : 'ltr' }}
    >
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="inline-block p-4 bg-primary-100 rounded-full mb-4">
            <Shield className="w-12 h-12 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {language === 'en' ? 'Admin Login' : language === 'he' ? 'כניסת מנהל' : 'تسجيل دخول المدير'}
          </h1>
          <p className="text-gray-600">
            {language === 'en' 
              ? 'Access the admin dashboard to manage games' 
              : language === 'he' 
              ? 'גש ללוח הבקרה כדי לנהל משחקים' 
              : 'الوصول إلى لوحة تحكم المدير لإدارة الألعاب'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-danger-50 border-2 border-danger-200 rounded-lg text-danger-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'en' ? 'Email' : language === 'he' ? 'אימייל' : 'البريد الإلكتروني'}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={language === 'en' ? 'admin@example.com' : language === 'he' ? 'admin@example.com' : 'admin@example.com'}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none text-lg"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'en' ? 'Password' : language === 'he' ? 'סיסמה' : 'كلمة المرور'}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={language === 'en' ? '••••••••' : language === 'he' ? '••••••••' : '••••••••'}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none text-lg"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="w-5 h-5" />
              <span>
                {isSubmitting 
                  ? (language === 'en' ? 'Logging in...' : language === 'he' ? 'מתחבר...' : 'جارٍ تسجيل الدخول...')
                  : (language === 'en' ? 'Login' : language === 'he' ? 'התחבר' : 'تسجيل الدخول')
                }
              </span>
            </button>
          </form>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
          >
            {language === 'en' ? '← Back to Home' : language === 'he' ? '← חזרה לדף הבית' : '← العودة إلى الصفحة الرئيسية'}
          </Link>
        </div>
      </div>
    </div>
  );
}

