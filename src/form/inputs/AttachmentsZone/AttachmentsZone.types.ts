import { GridProps } from '@mui/material';
import { DropzoneOptions } from 'react-dropzone';
import { FieldValues } from 'react-hook-form';

import { AttachmentsZoneFile } from './AttachmentsZoneFiles.types';
import { BaseInputProps } from '../../core/BaseInput';

export type AttachmentsZoneProps<TFields extends FieldValues> =
  BaseInputProps<TFields> & {
    mode?: 'hasura';
    source?: string;
    uploadUrl?: string;
    entityId: string | number | Record<string, string | number>;
    attachmentsTypes: { value: string; text: string }[];
    filter?: Record<string, any>;
    helperText?: string;
    error?: boolean;
    title?: string;
    dropzoneProps?: DropzoneOptions;
    gridProps?: GridProps;
    showSections?: boolean;
    displayMode?: 'informative' | 'simple';
    onFilesChange?: (files: AttachmentsZoneFile[]) => void;
    disableInitialLoad?: boolean;
  };
