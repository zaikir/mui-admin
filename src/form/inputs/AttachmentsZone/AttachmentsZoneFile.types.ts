import { AttachmentsZoneFile } from './AttachmentsZoneFiles.types';

export type AttachmentsZoneFileProps = AttachmentsZoneFile & {
  source: string;
  foreignKey: string;
  foreignKeyValue: string | number | Record<string, string | number>;
  contentType: string;
  readOnly?: boolean;
  displayMode?: 'informative' | 'simple';
  onChange: (newFile: AttachmentsZoneFile) => void;
  onDelete: () => void;
  onImageOpen?: () => void;
};
