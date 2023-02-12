import { BoxProps, TextFieldProps } from '@mui/material';
import { DropzoneOptions } from 'react-dropzone';
import { FieldValues } from 'react-hook-form';

import { BaseInputProps } from '../../core/BaseInput';

export type FileInputProps<TFields extends FieldValues> =
  BaseInputProps<TFields> & {
    mode?: 'hasura';
    source?: string;
    uploadUrl?: string;
    helperText?: TextFieldProps['helperText'];
    label?: TextFieldProps['label'];
    error?: boolean;
    disabled?: boolean;
    sx?: BoxProps['sx'];
    dropzoneProps?: DropzoneOptions;
  };
