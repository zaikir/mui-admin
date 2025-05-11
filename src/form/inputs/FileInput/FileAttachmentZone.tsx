import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  useTheme,
} from '@mui/material';
import { CloudUploadOutline } from 'mdi-material-ui';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { ConfigurationContext } from 'contexts/ConfigurationContext';
import { NotificationsContext } from 'contexts/NotificationsContext';
import { FormConfigContext } from 'form/contexts/FormConfigContext';

import AttachmentsZoneFiles from './AttachmentsZoneFiles';
import { AttachmentsZoneFile } from './AttachmentsZoneFiles.types';
import { FileAttachmentZoneProps } from './FileAttachmentZone.types';

export default function FileAttachmentZone({
  fileId,
  onChange,
  label,
  source: initialSource,
  required,
  error,
  helperText,
  dropzoneProps,
  ...rest
}: FileAttachmentZoneProps) {
  const source = initialSource ?? 'file';
  const Source = source.charAt(0).toUpperCase() + source.slice(1);
  const { readOnly } = useContext(FormConfigContext);
  const isReadOnly = rest.readOnly || readOnly;

  const theme = useTheme();
  const [file, setFile] = useState<AttachmentsZoneFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { hasura, translations } = useContext(ConfigurationContext)!;
  const { showPrompt, showAlert } = useContext(NotificationsContext);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    disabled: isReadOnly,
    onDrop: useCallback(
      async (acceptedFiles: File[]) => {
        const [acceptedFile] = acceptedFiles;
        if (!acceptedFile) {
          return;
        }

        const parts = acceptedFile.name.trim().split('.');
        const extension = `.${parts[parts.length - 1]}`;

        setIsUploading(true);
        setFile({
          id: Math.random(),
          name: acceptedFile.name.replace(extension, ''),
          extension,
          size: acceptedFile.size,
          createdAt: new Date().toISOString(),
          fileToUpload: acceptedFile,
        });
      },
      [showPrompt],
    ),
    ...dropzoneProps,
  });

  useEffect(() => {
    if (!isUploading) {
      return;
    }

    const isUploaded = file && !file.fileToUpload;
    if (isUploaded) {
      showAlert(translations.attachmentsUploadedSuccessfully, 'success');
    }
    setIsLoading(false);
  }, [
    file,
    isUploading,
    showAlert,
    translations.attachmentsUploadedSuccessfully,
  ]);

  useEffect(() => {
    (async () => {
      if (fileId == null) {
        setFile(null);
        setIsLoading(false);
        return;
      }

      const {
        items: [item],
      } = await hasura.request({
        type: 'custom',
        query: `
        query FilesFetch($where: ${Source}BoolExp) {
          items: ${source}(where: $where, limit: 1) {
            id name extension size createdAt attachmentType metadata
          }
        }`
          .replace(/\n/g, ' ')
          .replace(/ +/g, ' ')
          .trim(),
        variables: {
          where: { id: { _eq: fileId } },
        },
      });

      setFile(item);
      setIsLoading(false);
    })();
  }, [fileId]);

  return (
    <FormControl required={required} size="small" sx={{ flex: 1 }}>
      <Box>
        {label && (
          <FormLabel
            error={error}
            required={required}
            className="MuiFormLabel-root MuiInputLabel-root MuiInputLabel-formControl MuiInputLabel-animated MuiInputLabel-shrink MuiInputLabel-outlined MuiFormLabel-colorPrimary MuiFormLabel-filled Mui-required MuiInputLabel-root MuiInputLabel-formControl MuiInputLabel-animated MuiInputLabel-shrink MuiInputLabel-outlined css-1igsam7-MuiFormLabel-root-MuiInputLabel-root"
            sx={{
              padding: '0px 5px !important',
              margin: '0px -5px',
              backgroundColor: 'white',
              position: 'absolute',
              transform: `translate(14px, -9px) scale(0.75)`,
            }}
          >
            {label}
          </FormLabel>
        )}
        <Box
          {...getRootProps()}
          sx={{
            borderRadius: 1,
            cursor: 'pointer',
            border: 'thin solid transparent',
            backgroundColor: 'transparent',
            ...(isDragActive && {
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
            }),
            ...(!file && {
              border: 'thin solid #e6e8f0',
              ...(!isReadOnly &&
                !rest.disabled && {
                  '&:hover': {
                    border: `thin solid ${theme.palette.text.primary}`,
                  },
                }),
            }),
            ...(error && {
              border: `thin solid ${theme.palette.error.main} !important`,
            }),
          }}
        >
          <input {...getInputProps()} />
          {isLoading || file ? (
            <AttachmentsZoneFiles
              isLoading={isLoading}
              file={file}
              source={source}
              readOnly={isReadOnly}
              onFileChange={(newFile) => {
                onChange(newFile.id as any);
              }}
              onFileDelete={(file) => {
                onChange(null);
              }}
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                opacity: 0.5,
                height: 95,
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
  );
}
