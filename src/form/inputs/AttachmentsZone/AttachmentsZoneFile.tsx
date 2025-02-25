import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import EditIcon from '@mui/icons-material/Edit';
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

import { AttachmentsZoneFileProps } from './AttachmentsZoneFile.types';
import { getFileIcon } from '../../utils/getFileIcon';

export default function AttachmentsZoneFile({
  id,
  name,
  extension,
  contentType,
  createdAt,
  size,
  fileToUpload,
  attachmentType,
  foreignKey,
  foreignKeyValue,
  source,
  readOnly,
  displayMode,
  onChange,
  onDelete,
  onRename,
  onMove,
  onImageOpen,
}: AttachmentsZoneFileProps) {
  const Source = source.charAt(0).toUpperCase() + source.slice(1);
  const isSkeletonVisible = !name;
  const theme = useTheme();
  const {
    rest: { client: apiClient },
    hasura,
    translations,
    defaultDeleteFileConfirm,
  } = useContext(ConfigurationContext)!;
  const { showConfirm } = useContext(NotificationsContext)!;
  const [isUploading, setIsUploading] = useState(!!fileToUpload);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('attachmentType', attachmentType);
      if (typeof foreignKeyValue === 'object') {
        Object.entries(foreignKeyValue).forEach(([key, value]) => {
          formData.append(key, value.toString());
        });
      } else {
        formData.append(foreignKey, foreignKeyValue.toString());
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
    [
      apiClient,
      attachmentType,
      foreignKey,
      JSON.stringify(foreignKeyValue),
      onChange,
    ],
  );

  const handleDelete = async () => {
    setMenuAnchorEl(null);

    const isAllowed = await showConfirm(defaultDeleteFileConfirm);
    if (!isAllowed) {
      return;
    }

    await hasura.request({
      type: 'custom',
      query: `mutation DeleteFile($where: ${Source}BoolExp!, $set: ${Source}SetInput!) {
        update${Source}(where: $where, _set: $set) {
          __typename
        }
      }`,
      variables: {
        where: {
          id: { _eq: id },
        },
        set: hasura.removeUpdate,
      },
    });

    onDelete();
  };

  useEffect(() => {
    if (!fileToUpload) {
      return;
    }

    uploadFile(fileToUpload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'white',
        cursor: 'pointer',
        ...(displayMode === 'simple'
          ? {
              '&:hover img, &:hover video': {
                outline: `thin solid #d2d2d2`,
              },
            }
          : {
              border: 'thin solid #e6e8f0',
              borderRadius: 1,
              p: 1,
              boxShadow: 4,
              '&:hover': {
                border: `thin dashed ${theme.palette.text.primary}`,
              },
            }),
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (menuAnchorEl) {
          return;
        }

        if (onImageOpen) {
          onImageOpen();
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
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: displayMode === 'simple' ? 100 : 38,
            height: displayMode === 'simple' ? 100 : 38,
            px: displayMode === 'simple' ? 0 : 0.5,
          }}
        >
          {isSkeletonVisible ? (
            <Skeleton variant="rectangular" width="100%" height="100%" />
          ) : (
            getFileIcon(extension, {
              contentType,
              id,
              baseUrl: apiClient.defaults.baseURL!,
              size: displayMode === 'simple' ? 300 : 100,
            })
          )}
        </Box>
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            pl: 1,
            display: displayMode === 'simple' ? 'none' : 'flex',
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
            noWrap
            variant="body2"
            sx={{
              fontSize: '0.75rem',
            }}
          >
            {isSkeletonVisible ? (
              <Skeleton />
            ) : (
              <>
                {new Date(createdAt).toLocaleDateString()}, {prettyBytes(size)}
              </>
            )}
          </Typography>
        </Box>
        {!isUploading ? (
          <>
            {(displayMode !== 'simple' || !readOnly) && (
              <>
                <IconButton
                  size="small"
                  sx={{ ml: 0.5 }}
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
                    <>
                      <MenuItem onClick={onRename}>
                        <ListItemIcon>
                          <EditIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>
                          {translations.attachmentsFileMenuRename}
                        </ListItemText>
                      </MenuItem>
                      {onMove && (
                        <MenuItem onClick={onMove}>
                          <ListItemIcon>
                            <DriveFileMoveOutlinedIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>
                            {translations.attachmentsFileMenuMove}
                          </ListItemText>
                        </MenuItem>
                      )}
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
                    </>
                  )}
                </Menu>
              </>
            )}
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
