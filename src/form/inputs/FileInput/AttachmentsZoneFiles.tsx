import FileAvatar from './AttachmentsZoneFile';
import {
  AttachmentsZoneFile,
  AttachmentsZoneFilesProps,
} from './AttachmentsZoneFiles.types';

export default function AttachmentsZoneFiles({
  file,
  isLoading,
  source,
  readOnly,
  onFileChange,
  onFileDelete,
}: AttachmentsZoneFilesProps) {
  const skeletonFile = {
    id: 0,
    name: null,
    extension: null,
  } as unknown as AttachmentsZoneFile;

  if (!file) {
    return (
      <FileAvatar
        {...skeletonFile}
        source={source}
        readOnly={readOnly}
        onChange={() => {}}
        onDelete={() => {}}
      />
    );
  }

  return (
    <FileAvatar
      {...file}
      source={source}
      readOnly={readOnly}
      onChange={(newFile) => {
        onFileChange(newFile, file);
      }}
      onDelete={() => {
        onFileDelete(file);
      }}
    />
  );
}
