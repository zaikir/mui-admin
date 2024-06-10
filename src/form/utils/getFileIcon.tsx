import { Box, Skeleton } from '@mui/material';
import { useEffect, useState } from 'react';
// @ts-ignore
import { FileIcon, defaultStyles } from 'react-file-icon';
import { useInView } from 'react-intersection-observer';

function ImageWithSkeleton({
  src,
  width,
  height,
}: {
  src: string;
  width: number | string;
  height: number | string;
}) {
  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0,
  });

  const [startedLoading, setStartedLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleImageLoad = () => {
    setLoading(false);
  };

  useEffect(() => {
    if (!inView || startedLoading) {
      return;
    }

    setStartedLoading(true);
  }, [inView, startedLoading]);

  return (
    <Box position="relative" width={width} height={height} ref={ref}>
      {loading && (
        <Skeleton
          variant="rectangular"
          sx={{ width: '100%', height: '100%', borderRadius: '4px' }}
        />
      )}
      {startedLoading && (
        <Box
          component="img"
          onLoad={handleImageLoad}
          sx={{
            display: loading ? 'none' : 'block',
            width: '100%',
            height: '100%',
            borderRadius: '4px',
            objectFit: 'cover',
          }}
          src={src}
        />
      )}
    </Box>
  );
}

export function getFileIcon(
  extension: string,
  file?: {
    contentType: string;
    id: number | string;
    baseUrl: string;
    size?: number;
    thumbnail?: string;
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
        if (file?.contentType.startsWith('image/') || file?.thumbnail) {
          return (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                position: 'relative',
              }}
            >
              <ImageWithSkeleton
                src={
                  file?.thumbnail ??
                  `${file.baseUrl}/files/w_${file.size ?? 100},h_${
                    file.size ?? 100
                  },c_limit/${file.id}`
                }
                width="100%"
                height="100%"
              />
              {file?.contentType.startsWith('video/') && (
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
              )}
            </Box>
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
                preload="metadata"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '4px',
                }}
              >
                <source
                  src={`${file.baseUrl}/files/${file.id}#t=0.1`}
                  type={file?.contentType}
                />
              </Box>
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
