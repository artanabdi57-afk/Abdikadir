import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (key, fallback) => fallback || key,
  dir: 'ltr',
  isRTL: false,
});

export const AVAILABLE_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'so', label: 'Somali', nativeLabel: 'Af-Soomaali', flag: '🇸🇴', dir: 'ltr' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', flag: '🇸🇦', dir: 'rtl' },
];

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem('sahan_language');
      if (saved && ['en', 'so', 'ar'].includes(saved)) {
        return saved;
      }
      // Check browser language
      const navLang = navigator.language || '';
      if (navLang.startsWith('so')) return 'so';
      if (navLang.startsWith('ar')) return 'ar';
    } catch {
      // fallback
    }
    return 'en';
  });

  const setLang = (newLang) => {
    if (['en', 'so', 'ar'].includes(newLang)) {
      setLangState(newLang);
      try {
        localStorage.setItem('sahan_language', newLang);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const isRTL = lang === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    if (isRTL) {
      document.body.classList.add('rtl-mode');
    } else {
      document.body.classList.remove('rtl-mode');
    }
  }, [lang, dir, isRTL]);

  const t = (key, fallback) => {
    const langDict = translations[lang] || translations.en;
    if (langDict && langDict[key] !== undefined) {
      return langDict[key];
    }
    const enDict = translations.en;
    if (enDict && enDict[key] !== undefined) {
      return enDict[key];
    }
    return fallback !== undefined ? fallback : key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir, isRTL, languages: AVAILABLE_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

