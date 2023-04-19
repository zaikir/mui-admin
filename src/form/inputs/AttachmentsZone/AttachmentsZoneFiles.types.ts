import { GridProps } from '@mui/material';

type FetchedFile = {
  id: string | number;
  name: string;
  extension: string;
  size: number;
  createdAt: string;
  attachmentType: string;
  fileToUpload?: File;
};

export type AttachmentsZoneFile = FetchedFile & object;

export type AttachmentsZoneFilesProps = {
  source: string;
  files: AttachmentsZoneFile[];
  foreignKey: string;
  foreignKeyValue: string | number;
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
  gridProps?: GridProps;
};
