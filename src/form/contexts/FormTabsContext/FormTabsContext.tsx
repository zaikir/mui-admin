import { createContext } from 'react';

export type FormTabsContextType = {
  tab: string;
  setTab: React.Dispatch<React.SetStateAction<string>>;
  register: (name: string, tab: string) => void;
  unregister: (name: string) => void;
};

export const FormTabsContext = createContext<FormTabsContextType>(null as any);
