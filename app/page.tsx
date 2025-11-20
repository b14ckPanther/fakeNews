'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLocalization } from '@/lib/localization';
import { createGame } from '@/lib/firestore';
import { Gamepad2, Scan } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { t, language, isRTL, fontFamily } = useLocalization();
  const [gamePin, setGamePin] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mark as mounted to prevent hydration mismatch
    setMounted(true);
    // Generate a 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    setGamePin(pin);
  }, []);

  const handleCreateGame = async () => {
    if (!auth) return;
    setIsCreating(true);
    try {
      const userCredential = await signInAnonymously(auth);
      if (userCredential.user) {
        const gameId = await createGame(userCredential.user.uid, gamePin);
        router.push(`/admin?gameId=${gameId}&pin=${gamePin}`);
      }
    } catch (error) {
      console.error('Error creating game:', error);
      setIsCreating(false);
    }
  };

  const handleJoinGame = () => {
    setShowPinEntry(true);
  };

  const handlePinSubmit = () => {
    if (pinInput.length === 6) {
      router.push(`/player?pin=${pinInput}`);
    }
  };

  const url = mounted && typeof window !== 'undefined' && gamePin ? `${window.location.origin}/player?pin=${gamePin}` : '';

  if (!mounted) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-success-50"
        style={{ fontFamily, direction: isRTL ? 'rtl' : 'ltr' }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-success-50"
      style={{ fontFamily, direction: isRTL ? 'rtl' : 'ltr' }}
    >
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

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
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <Gamepad2 className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('home.create')}</h2>
              {url && <QRCodeDisplay value={url} size={200} />}
              {gamePin && <p className="text-sm text-gray-600 mt-4">PIN: {gamePin}</p>}
              <button
                onClick={handleCreateGame}
                disabled={isCreating}
                className="mt-6 w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : t('home.create')}
              </button>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl flex flex-col justify-center">
              <Scan className="w-16 h-16 text-success-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('home.join')}</h2>
              <p className="text-gray-600 mb-6">
                {language === 'en' && 'Scan the QR code or enter PIN'}
                {language === 'he' && 'סרוק את קוד QR או הזן PIN'}
                {language === 'ar' && 'امسح رمز QR أو أدخل PIN'}
              </p>
              <button
                onClick={handleJoinGame}
                className="w-full px-6 py-3 bg-success-600 text-white rounded-lg font-semibold hover:bg-success-700 transition-colors"
              >
                {t('home.join')}
              </button>
            </div>
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
  );
}

