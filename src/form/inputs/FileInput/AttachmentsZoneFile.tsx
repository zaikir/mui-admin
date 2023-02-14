import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  CircularProgress,
  Box,
  IconButton,
  Skeleton,
  Typography,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import prettyBytes from 'pretty-bytes';
import { useCallback, useContext, useEffect, useState } from 'react';

import { ConfigurationContext } from 'contexts/ConfigurationContext';
import { NotificationsContext } from 'contexts/NotificationsContext';
import { getFileIcon } from 'form/utils/getFileIcon';

import { AttachmentsZoneFileProps } from './AttachmentsZoneFile.types';

export default function AttachmentsZoneFile({
  id,
  name,
  extension,
  createdAt,
  size,
  fileToUpload,
  attachmentType,
  source,
  readOnly,
  metadata,
  onChange,
  onDelete,
}: AttachmentsZoneFileProps) {
  const isSkeletonVisible = !name;
  const theme = useTheme();
  const {
    rest: { client: apiClient },
    translations,
    defaultDeleteFileConfirm,
  } = useContext(ConfigurationContext)!;
  const { showConfirm } = useContext(NotificationsContext)!;
  const [isUploading, setIsUploading] = useState(!!fileToUpload);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const getFileImage = useCallback(
    (extension: string) => {
      if (!id || (typeof id === 'number' && id < 1)) {
        return null;
      }

      if (
        ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.bmp'].includes(
          extension.toLowerCase(),
        )
      ) {
        return (
          <Box
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            component="img"
            src={`${apiClient.defaults.baseURL}/files/w_100,c_limit/${id}`}
          />
        );
      }

      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
          }}
        >
          {getFileIcon(extension)}
        </Box>
      );
    },
    [extension, id],
  );

  const uploadFile = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      if (attachmentType) {
        formData.append('attachmentType', attachmentType);
      }

      const response = await apiClient.post('/files', formData, {
        onUploadProgress(progressEvent) {
          if (!progressEvent) {
            return;
          }

          const percentCompleted = !progressEvent.total
            ? 0
            : Math.round((progressEvent.loaded * 100) / progressEvent.total);

          setUploadProgress(percentCompleted);
        },
      });

      setIsUploading(false);
      onChange({
        ...(response.data as any),
      });
    },
    [apiClient, attachmentType, onChange],
  );

  const handleDelete = async () => {
    setMenuAnchorEl(null);

    const isAllowed = await showConfirm(defaultDeleteFileConfirm);
    if (!isAllowed) {
      return;
    }

    onDelete();
  };

  const getMetadata = () => {
    const entries = [prettyBytes(size)];

    if (!metadata) {
      return entries.join(', ');
    }

    if (metadata.width && metadata.height) {
      entries.push(`${metadata.width}x${metadata.height}`);
    }

    if (metadata.duration) {
      const duration = new Date(metadata.duration * 1000)
        .toISOString()
        .slice(11, 19);

      entries.push(duration.startsWith('00:') ? duration.slice(3) : duration);
    }

    if (metadata.sample_rate) {
      entries.push(`${(metadata.sample_rate / 1000).toFixed(1)} kHz`);
    }

    return entries.join(', ');
  };

  useEffect(() => {
    if (!fileToUpload) {
      return;
    }

    uploadFile(fileToUpload);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'white',
        border: 'thin solid #e6e8f0',
        borderRadius: 1,
        py: 1.2,
        pl: 1.2,
        pr: 0,
        boxShadow: 4,
        cursor: 'pointer',
        '&:hover': {
          border: `thin dashed ${theme.palette.text.primary}`,
        },
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (menuAnchorEl) {
          return;
        }

        window.open(
          encodeURI(
            `${apiClient.defaults.baseURL}/files/${id}/${name}${extension}`,
          ),
          '_blank',
        );
      }}
    >
      <Box sx={{ display: 'flex' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 74,
            height: 74,
          }}
        >
          {isSkeletonVisible ? (
            <Skeleton variant="rectangular" width="100%" height="100%" />
          ) : (
            getFileImage(extension)
          )}
        </Box>
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            pl: 1.5,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography
            noWrap
            variant="body2"
            sx={{
              fontWeight: '500',
              fontSize: '0.75rem',
            }}
          >
            {isSkeletonVisible ? <Skeleton /> : name}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.75rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {isSkeletonVisible ? <Skeleton /> : <>{getMetadata()}</>}
          </Typography>
          <Typography
            noWrap
            variant="body2"
            sx={{
              fontSize: '0.75rem',
              mt: 'auto',
            }}
          >
            {isSkeletonVisible ? (
              <Skeleton />
            ) : (
              <>{new Date(createdAt).toLocaleDateString()}</>
            )}
          </Typography>
        </Box>
        {!isUploading ? (
          <>
            <IconButton
              sx={{ ml: 0.5, alignSelf: 'center' }}
              disabled={isSkeletonVisible}
              onClick={(event) => {
                event.stopPropagation();
                setMenuAnchorEl(event.currentTarget);
              }}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={() => {
                setMenuAnchorEl(null);
              }}
            >
              <MenuItem
                component="a"
                href={`${apiClient.defaults.baseURL}/files/${id}?download=true`}
                download
                onClick={(event) => {
                  event.stopPropagation();
                  setMenuAnchorEl(null);
                }}
              >
                <ListItemIcon>
                  <FileDownloadIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                  {translations.attachmentsFileMenuDownload}
                </ListItemText>
              </MenuItem>
              {!readOnly && (
                <MenuItem
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDelete();
                  }}
                >
                  <ListItemIcon>
                    <DeleteForeverIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>
                    {translations.attachmentsFileMenuDelete}
                  </ListItemText>
                </MenuItem>
              )}
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
            <CircularProgress
              size={27}
              variant="determinate"
              value={uploadProgress}
              sx={{ color: 'black', opacity: 0.5 }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
