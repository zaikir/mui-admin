import {
  Box,
  FormControl,
  FormHelperText,
  Typography,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { CloudUploadOutline } from 'mdi-material-ui';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FieldValues } from 'react-hook-form';

import { ConfigurationContext } from 'contexts/ConfigurationContext';
import { NotificationsContext } from 'contexts/NotificationsContext';

import { AttachmentsZoneProps } from './AttachmentsZone.types';
import AttachmentsZoneFiles from './AttachmentsZoneFiles';
import { AttachmentsZoneFile } from './AttachmentsZoneFiles.types';
import { FormConfigContext } from '../../contexts/FormConfigContext';
import { AutocompleteInput } from '../AutocompleteInput';

export default function AttachmentsZone<TFields extends FieldValues>({
  value,
  name,
  entityId,
  attachmentsTypes,
  required,
  xs,
  sm,
  md,
  lg,
  xl,
  helperText,
  error,
  source: initialSource,
  title,
  dropzoneProps,
  gridProps,
  displayMode,
  ...rest
}: AttachmentsZoneProps<TFields>) {
  const source = initialSource ?? 'file';
  const Source = source.charAt(0).toUpperCase() + source.slice(1);
  const { readOnly } = useContext(FormConfigContext);
  const isReadOnly = rest.readOnly || readOnly;

  const theme = useTheme();
  const [files, setFiles] = useState<AttachmentsZoneFile[]>(value ?? []);
  const [isLoading, setIsLoading] = useState(!value);
  const [isUploading, setIsUploading] = useState(false);
  const {
    rest: { client: apiClient },
    hasura,
    translations,
  } = useContext(ConfigurationContext)!;
  const { showPrompt, showAlert } = useContext(NotificationsContext);

  const uploadFile = useCallback(
    async (file: File, attachmentType: string) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('attachmentType', attachmentType);

      apiClient.post('/files', formData);
    },
    [apiClient],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    disabled: isReadOnly,
    onDrop: useCallback(
      async (acceptedFiles: File[]) => {
        const attachmentType = await (async () => {
          if (attachmentsTypes.length === 1) {
            return attachmentsTypes[0].value;
          }

          const result = await showPrompt({
            title: translations.attachmentsZoneTitle,
            text: translations.attachmentsZoneText,
            form: (
              <AutocompleteInput
                name="attachmentType"
                label={translations.attachmentsZoneLabel}
                options={attachmentsTypes}
                required
                inputProps={{
                  autoFocus: true,
                  autoComplete: 'none',
                }}
              />
            ),
            accept: translations.attachmentsZoneAccept,
            cancel: translations.attachmentsZoneCancel,
          });

          if (!result) {
            return false;
          }

          return result.attachmentType;
        })();

        if (!attachmentType || !acceptedFiles.length) {
          return;
        }

        setIsUploading(true);
        setFiles((items) => [
          ...items,
          ...acceptedFiles.map((file) => {
            const parts = file.name.trim().split('.');
            const extension = `.${parts[parts.length - 1]}`;

            return {
              id: Math.random(),
              name: file.name.replace(extension, ''),
              extension,
              size: file.size,
              createdAt: new Date().toISOString(),
              attachmentType,
              contentType: file.type,
              fileToUpload: file,
            };
          }),
        ]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      },
      [uploadFile, showPrompt],
    ),
    ...dropzoneProps,
  });

  useEffect(() => {
    if (!isUploading) {
      return;
    }

    const isUploaded = !files.some((x) => !!x.fileToUpload);
    if (isUploaded) {
      showAlert(translations.attachmentsUploadedSuccessfully, 'success');
    }
    setIsLoading(false);
  }, [
    files,
    isUploading,
    showAlert,
    translations.attachmentsUploadedSuccessfully,
  ]);

  useEffect(() => {
    if (value) {
      return;
    }

    (async () => {
      const { items } = await hasura.request({
        type: 'custom',
        query: `
        query FilesFetch($where: ${Source}BoolExp) {
          items: ${source}(where: $where) {
            id name extension size createdAt attachmentType contentType ${name}
          }
        }`
          .replace(/\n/g, ' ')
          .replace(/ +/g, ' ')
          .trim(),
        variables: {
          where:
            typeof entityId === 'object'
              ? Object.fromEntries(
                  Object.entries(entityId).map(([key, value]) => [
                    key,
                    { _eq: value },
                  ]),
                )
              : { [name]: { _eq: entityId } },
        },
      });

      setFiles(items);
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Grid
      xs={xs ?? 12}
      sm={sm}
      md={md}
      lg={lg}
      xl={xl}
      sx={{ display: 'flex', alignItems: 'center' }}
    >
      <FormControl required={required} size="small" sx={{ flex: 1 }}>
        <Box>
          {title && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                height: '40px',
                mb: 1,
              }}
            >
              <Typography variant="subtitle1">{title}</Typography>
            </Box>
          )}
          <Box
            {...getRootProps()}
            sx={{
              borderRadius: 1,
              border: 'thin solid #e6e8f0',
              p: 3,
              ...(!rest.readOnly && { cursor: 'pointer' }),
              backgroundColor: 'transparent',
              ...(!files.length && {
                '&:hover': {
                  border: `thin solid ${theme.palette.text.primary}`,
                },
              }),
              ...(isDragActive && {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
              }),
            }}
          >
            <input {...getInputProps()} />
            {isLoading || files.length ? (
              <AttachmentsZoneFiles
                isLoading={isLoading}
                files={files}
                attachmentsTypes={attachmentsTypes}
                foreignKey={name}
                foreignKeyValue={entityId}
                source={source}
                readOnly={isReadOnly}
                showSections={rest?.showSections ?? attachmentsTypes.length > 1}
                onFileChange={(newFile, oldFile) => {
                  setFiles((items) =>
                    items.map((x) => (x.id === oldFile.id ? newFile : x)),
                  );
                }}
                onFileDelete={(file) => {
                  setFiles((items) => items.filter((x) => x.id !== file.id));
                }}
                gridProps={gridProps}
                displayMode={displayMode}
              />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  opacity: 0.7,
                  height: 90 - (attachmentsTypes.length > 1 ? 0 : 22),
                  textAlign: 'center',
                }}
              >
                {!isReadOnly ? (
                  <>
                    <CloudUploadOutline />
                    {translations.attachmentsUploadedOrDropFileHere}
                  </>
                ) : (
                  translations.attachmentsNoFiles
                )}
              </Box>
            )}
          </Box>
        </Box>
        <FormHelperText error={!!error}>{helperText || ' '}</FormHelperText>
      </FormControl>
    </Grid>
  );
}
