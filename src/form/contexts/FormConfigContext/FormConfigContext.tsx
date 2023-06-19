import { createContext } from 'react';

import { PromiseOrValue } from 'index';

export type FormConfigContextType = {
  dense?: boolean;
  readOnly?: boolean;
  spacing: number;
  subscribeFormSubmit: (func: () => PromiseOrValue<void>) => () => void;
};

export const DefaultConfiguration: FormConfigContextType = {
  dense: false,
  readOnly: false,
  spacing: 2,
  subscribeFormSubmit: null as any,
};

export const FormConfigContext =
  createContext<FormConfigContextType>(DefaultConfiguration);

type Props = {
  children: React.ReactNode;
} & FormConfigContextType;

export function FormConfigProvider({ children, ...rest }: Props) {
  return (
    <FormConfigContext.Provider value={rest}>
      {children}
    </FormConfigContext.Provider>
  );
}
