"use client";

import { createContext, useContext, ReactNode } from "react";
import { TranslationKey, getDictionary, translations, Locale } from "@/utils/i18n";
export type { TranslationKey };

type Dictionary = typeof translations.en;

const DictionaryContext = createContext<Dictionary>(translations.en);

export const DictionaryProvider = ({ 
  dictionary, 
  children 
}: { 
  dictionary: Dictionary; 
  children: ReactNode 
}) => {
  return (
    <DictionaryContext.Provider value={dictionary}>
      {children}
    </DictionaryContext.Provider>
  );
};

export const useDictionary = () => {
  return useContext(DictionaryContext);
};
