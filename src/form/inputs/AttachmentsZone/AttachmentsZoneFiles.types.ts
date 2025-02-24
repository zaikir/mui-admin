import { GridProps } from '@mui/material';

type FetchedFile = {
  id: string | number;
  name: string;
  extension: string;
  size: number;
  createdAt: string;
  contentType: string;
  attachmentType: string;
  fileToUpload?: File;
};

export type AttachmentsZoneFile = FetchedFile & object;

export type AttachmentsZoneFilesProps = {
  source: string;
  files: AttachmentsZoneFile[];
  foreignKey: string;
  foreignKeyValue: string | number | Record<string, string | number>;
  isLoading?: boolean;
  showSections: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  attachmentsTypes: { value: string; text: string }[];
  onFileChange: (
    newFile: AttachmentsZoneFile,
    oldFile: AttachmentsZoneFile,
  ) => void;
  onFileDelete: (file: AttachmentsZoneFile) => void;
  onImageOpen: (file: AttachmentsZoneFile) => void;
  gridProps?: GridProps;
  displayMode?: 'simple' | 'informative';
};
