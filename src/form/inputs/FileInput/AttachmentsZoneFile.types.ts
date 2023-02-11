import { AttachmentsZoneFile } from './AttachmentsZoneFiles.types';

export type AttachmentsZoneFileProps = AttachmentsZoneFile & {
  source: string;
  readOnly?: boolean;
  onChange: (newFile: AttachmentsZoneFile) => void;
  onDelete: () => void;
};
