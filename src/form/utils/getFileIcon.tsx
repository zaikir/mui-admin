// @ts-ignore
import { FileIcon, defaultStyles } from 'react-file-icon';

export function getFileIcon(extension: string) {
  const ext = extension.replace(/\./g, '');
  if (!defaultStyles[ext]) {
    return <FileIcon extension={ext} {...defaultStyles.cue} />;
  }

  return <FileIcon extension={ext} {...defaultStyles[ext]} />;
}
