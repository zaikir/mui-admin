import { BoxProps, TextFieldProps } from '@mui/material';
import { DropzoneOptions } from 'react-dropzone';

import { BaseInputProps } from '../../core/BaseInput';

export type FileAttachmentZoneProps = Omit<BaseInputProps<any>, 'name'> & {
  fileId: number | null;
  onChange: (newId: number | null) => void;
  label?: TextFieldProps['label'];
  mode?: 'hasura';
  source?: string;
  uploadUrl?: string;
  helperText?: TextFieldProps['helperText'];
  error?: boolean;
  disabled?: boolean;
  sx?: BoxProps['sx'];
  dropzoneProps?: DropzoneOptions;
};
