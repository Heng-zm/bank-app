
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useLocalStorage } from './use-local-storage';
import en from '@/lang/en.json';
import km from '@/lang/km.json';

type Language = 'en' | 'km';
type Translations = typeof en;

const translations: Record<Language, Translations> = { en, km };

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [storedLanguage, setStoredLanguage] = useLocalStorage<Language>('language', 'en');
  const [language, setLanguage] = useState<Language>(storedLanguage);
  
  useEffect(() => {
    setLanguage(storedLanguage);
    document.documentElement.lang = storedLanguage;
    if (storedLanguage === 'km') {
        document.body.classList.add('font-khmer');
    } else {
        document.body.classList.remove('font-khmer');
    }
  }, [storedLanguage]);

  const setLanguageAndStore = (lang: Language) => {
    setLanguage(lang);
    setStoredLanguage(lang);
  };

  const t = useMemo(() => (key: string, options?: { [key: string]: string | number }): string => {
    const keys = key.split('.');
    let result: any = translations[language];

    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation is missing
        let fallbackResult: any = translations.en;
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
            if(fallbackResult === undefined) return key;
        }
        result = fallbackResult;
        break;
      }
    }
    
    if (typeof result !== 'string') return key;

    if (options) {
      result = Object.entries(options).reduce((acc, [optKey, optValue]) => {
        return acc.replace(new RegExp(`{{${optKey}}}`, 'g'), String(optValue));
      }, result);
    }

    return result;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: setLanguageAndStore, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
