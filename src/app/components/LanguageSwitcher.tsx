'use client';

import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
      className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-[#D94E33] transition-colors duration-200 rounded-lg hover:bg-orange-50"
      aria-label="Switch language"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
      <span className="font-medium">{language === 'en' ? 'EN' : '中文'}</span>
    </button>
  );
}