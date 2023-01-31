import { createContext } from 'react';

export type FormConfigContextType = {
  dense?: boolean;
  readOnly?: boolean;
};

export const DefaultConfiguration: FormConfigContextType = {
  dense: false,
  readOnly: false,
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
