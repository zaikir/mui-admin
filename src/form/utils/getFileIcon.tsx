import { Box } from '@mui/material';
// @ts-ignore
import { FileIcon, defaultStyles } from 'react-file-icon';

export function getFileIcon(
  extension: string,
  file?: { contentType: string; id: number | string; baseUrl: string },
) {
  const ext = extension.replace(/\./g, '');

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        svg: { width: '100%', height: '100%' },
      }}
    >
      {(() => {
        if (file?.contentType.startsWith('image/')) {
          return (
            <Box
              component="img"
              src={`${file.baseUrl}/files/w_100,c_limit/${file.id}`}
            />
          );
        }

        if (file?.contentType.startsWith('video/')) {
          return (
            <Box
              component="video"
              src={`${file.baseUrl}/files/${file.id}`}
              controls
            />
          );
        }

        return (
          <FileIcon
            extension={ext}
            {...(!defaultStyles[ext] ? defaultStyles.cue : defaultStyles[ext])}
          />
        );
      })()}
    </Box>
  );
}
