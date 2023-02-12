type FetchedFile = {
  id: string | number;
  name: string;
  extension: string;
  size: number;
  createdAt: string;
  attachmentType?: string;
  fileToUpload?: File;
  metadata?: Record<string, any> | null;
};

export type AttachmentsZoneFile = FetchedFile & object;

export type AttachmentsZoneFilesProps = {
  source: string;
  file: AttachmentsZoneFile | null;
  isLoading?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  onFileChange: (
    newFile: AttachmentsZoneFile,
    oldFile: AttachmentsZoneFile,
  ) => void;
  onFileDelete: (file: AttachmentsZoneFile) => void;
};
