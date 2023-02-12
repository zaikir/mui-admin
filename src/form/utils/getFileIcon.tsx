import { Box } from '@mui/material';
// @ts-ignore
import { FileIcon, defaultStyles } from 'react-file-icon';

export function getFileIcon(extension: string) {
  const ext = extension.replace(/\./g, '');

  return (
    <Box
      sx={{
        svg: { width: '100%', height: '100%' },
      }}
    >
      <FileIcon
        extension={ext}
        {...(!defaultStyles[ext] ? defaultStyles.cue : defaultStyles[ext])}
      />
    </Box>
  );
}
