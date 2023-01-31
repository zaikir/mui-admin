import { Control } from 'react-hook-form';

export type FormElementRef = {
  getControl: () => Control<any, any>;
  submit: () => Promise<void>;
  reset: (values?: any) => void;
};
