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

import { AttachmentsZoneFileProps } from './AttachmentsZoneFile.types';
import { getFileIcon } from '../../utils/getFileIcon';

export default function AttachmentsZoneFile({
  id,
  name,
  extension,
  createdAt,
  size,
  fileToUpload,
  attachmentType,
  foreignKey,
  foreignKeyValue,
  source,
  readOnly,
  onChange,
  onDelete,
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
      formData.append(foreignKey, foreignKeyValue.toString());

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
    [apiClient, attachmentType, foreignKey, foreignKeyValue, onChange],
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
        border: 'thin solid #e6e8f0',
        borderRadius: 1,
        p: 1,
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
            width: 38,
            height: 38,
            px: 0.5,
          }}
        >
          {isSkeletonVisible ? (
            <Skeleton variant="rectangular" width="100%" height="100%" />
          ) : (
            getFileIcon(extension)
          )}
        </Box>
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            pl: 1,
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
