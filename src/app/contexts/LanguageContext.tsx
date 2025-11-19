'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '../lib/translations';

type Language = 'en' | 'zh';
type TranslationType = typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationType;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Detect browser language on mount
    const detectLanguage = () => {
      // Check localStorage first for user preference
      const savedLang = localStorage.getItem('preferredLanguage') as Language;
      if (savedLang && (savedLang === 'en' || savedLang === 'zh')) {
        return savedLang;
      }

      // Check browser language
      const browserLang = navigator.language || (navigator as any).userLanguage;

      // Check if Chinese (zh, zh-CN, zh-TW, zh-HK, etc.)
      if (browserLang && browserLang.toLowerCase().startsWith('zh')) {
        return 'zh';
      }

      // Default to English
      return 'en';
    };

    const detectedLang = detectLanguage();
    setLanguage(detectedLang);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}