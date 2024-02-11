import { Box } from '@mui/material';
// @ts-ignore
import { FileIcon, defaultStyles } from 'react-file-icon';

export function getFileIcon(
  extension: string,
  file?: {
    contentType: string;
    id: number | string;
    baseUrl: string;
    size?: number;
  },
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
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: '4px',
                objectFit: 'cover',
              }}
              src={`${file.baseUrl}/files/w_${file.size ?? 100},c_limit/${
                file.id
              }`}
            />
          );
        }

        if (file?.contentType.startsWith('video/')) {
          return (
            <Box
              component="video"
              src={`${file.baseUrl}/files/${file.id}#t=0.1`}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '4px',
              }}
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
