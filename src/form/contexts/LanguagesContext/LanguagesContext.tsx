import { createContext } from 'react';

export type LanguagesContextType = {
  languages: {
    id: string | number;
    name: string;
  }[];
  defaultLanguageId: string | number;
};

export const LanguagesContext = createContext<LanguagesContextType>(
  null as any,
);
