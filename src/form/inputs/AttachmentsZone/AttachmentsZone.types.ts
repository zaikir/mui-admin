import { DropzoneOptions } from 'react-dropzone';
import { FieldValues } from 'react-hook-form';

import { BaseInputProps } from '../../core/BaseInput';

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
    dropzoneProps?: DropzoneOptions;
  };
