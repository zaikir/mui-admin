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
              sx={{
                width: '100%',
                height: '100%',
                position: 'relative',
              }}
            >
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
              <Box
                sx={{
                  pointerEvents: 'none',
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  top: 0,
                  left: 0,
                  margin: '13%',
                  opacity: 0.9,
                  color: 'white',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M8,5.14V19.14L19,12.14L8,5.14Z"
                    fill="currentColor"
                  />
                </svg>
              </Box>
            </Box>
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
