'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useLocalization } from '@/lib/localization';

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
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden"
      style={{ fontFamily, direction: isRTL ? 'rtl' : 'ltr' }}
    >
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
      </div>



      <div className="max-w-md w-full space-y-6 relative z-10">
        <div className="text-center">
          <div className="inline-block p-4 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 backdrop-blur-md rounded-full mb-4 border-2 border-white/20">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2">
            {language === 'en' ? 'Admin Login' : language === 'he' ? 'כניסת מנהל' : 'تسجيل دخول المدير'}
          </h1>
          <p className="text-white/80">
            {language === 'en'
              ? 'Access the admin dashboard to manage games'
              : language === 'he'
                ? 'גש ללוח הבקרה כדי לנהל משחקים'
                : 'الوصول إلى لوحة تحكم المدير لإدارة الألعاب'}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border-2 border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-500/20 border-2 border-red-400/50 rounded-lg text-white backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white/90 mb-2">
                {language === 'en' ? 'Email' : language === 'he' ? 'אימייל' : 'البريد الإلكتروني'}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={language === 'en' ? 'admin@example.com' : language === 'he' ? 'admin@example.com' : 'admin@example.com'}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:border-purple-400 focus:outline-none text-lg text-white placeholder-white/50"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white/90 mb-2">
                {language === 'en' ? 'Password' : language === 'he' ? 'סיסמה' : 'كلمة المرور'}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={language === 'en' ? '••••••••' : language === 'he' ? '••••••••' : '••••••••'}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:border-purple-400 focus:outline-none text-lg text-white placeholder-white/50"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-lg font-bold hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 transition-all shadow-2xl border-2 border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="text-white/80 hover:text-white font-semibold text-sm transition-colors"
          >
            {language === 'en' ? '← Back to Home' : language === 'he' ? '← חזרה לדף הבית' : '← العودة إلى الصفحة الرئيسية'}
          </Link>
        </div>
      </div>
    </div>
  );
}

