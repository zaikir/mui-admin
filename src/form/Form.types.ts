import { Control } from 'react-hook-form';

export type FormElementRef = {
  getControl: () => Control<any, any>;
  submit: (force?: boolean) => Promise<void>;
  reset: (values?: any) => void;
};
