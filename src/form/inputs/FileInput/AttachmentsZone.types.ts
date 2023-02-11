import { BaseInputProps } from '@kirz/mui-admin';
import { FieldValues } from 'react-hook-form';

export type AttachmentsZoneProps<TFields extends FieldValues> =
  BaseInputProps<TFields> & {
    mode?: 'hasura';
    source?: string;
    uploadUrl?: string;
    entityId: string | number;
    attachmentsTypes: { value: string; text: string }[];
    filter?: Record<string, any>;
    helperText?: string;
    error?: boolean;
    title?: string;
  };
