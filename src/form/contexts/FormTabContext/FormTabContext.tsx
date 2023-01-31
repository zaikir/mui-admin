import { createContext } from 'react';

export type FormTabContextType = {
  tab: string;
};

export const FormTabContext = createContext<FormTabContextType>(null as any);
