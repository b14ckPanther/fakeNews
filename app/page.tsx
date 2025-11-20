'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import Header from '@/components/Header';
import { useLocalization } from '@/lib/localization';
import { Gamepad2, Scan } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { t, language, isRTL, fontFamily } = useLocalization();
  const [pinInput, setPinInput] = useState('');
  const [showPinEntry, setShowPinEntry] = useState(false);

  const handleJoinGame = () => {
    setShowPinEntry(true);
  };

  const handlePinSubmit = () => {
    if (pinInput.length === 6) {
      router.push(`/player?pin=${pinInput}`);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-white to-success-50"
      style={{ fontFamily, direction: isRTL ? 'rtl' : 'ltr' }}
    >
      <Header />

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-gray-800">{t('app.title')}</h1>
            <p className="text-xl text-gray-600">
              {language === 'en' && 'Interactive game for fake news education'}
              {language === 'he' && 'משחק אינטראקטיבי לחינוך על פייק ניוז'}
              {language === 'ar' && 'لعبة تفاعلية للتعليم عن الأخبار المزيفة'}
            </p>
          </div>

          {!showPinEntry ? (
            <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md mx-auto">
              <Scan className="w-16 h-16 text-success-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('home.join')}</h2>
              <p className="text-gray-600 mb-6">
                {language === 'en' && 'Enter the game PIN to join'}
                {language === 'he' && 'הזן את PIN של המשחק להצטרף'}
                {language === 'ar' && 'أدخل رمز PIN للعبة للانضمام'}
              </p>
              <button
                onClick={handleJoinGame}
                className="w-full px-6 py-3 bg-success-600 text-white rounded-lg font-semibold hover:bg-success-700 transition-colors"
              >
                {t('home.join')}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('player.enterPin')}</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 text-center text-3xl font-mono border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                  maxLength={6}
                />
                <button
                  onClick={handlePinSubmit}
                  disabled={pinInput.length !== 6}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {t('home.join')}
                </button>
                <button
                  onClick={() => setShowPinEntry(false)}
                  className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  {language === 'en' ? 'Back' : language === 'he' ? 'חזור' : 'رجوع'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

