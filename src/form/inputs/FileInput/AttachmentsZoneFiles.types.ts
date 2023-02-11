type FetchedFile = {
  id: string | number;
  publicId: string;
  name: string;
  extension: string;
  size: number;
  createdAt: string;
  attachmentType?: string;
  fileToUpload?: File;
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
