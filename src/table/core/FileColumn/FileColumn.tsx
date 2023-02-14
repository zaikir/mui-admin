import { Box, Skeleton, Typography } from '@mui/material';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { FileHidden } from 'mdi-material-ui';
import { useContext, useEffect, useState } from 'react';

import { ConfigurationContext } from 'contexts/ConfigurationContext';
import { getFileIcon } from 'form/utils/getFileIcon';

import { BaseDataTableFileColumnDef } from '../BaseDataTable';

export type FileColumnProps = GridRenderCellParams<any, any, any>;

type FileInfo = {
  contentType: string;
  name: string;
  extension: string;
};

function FileContent(props: {
  id: number | string;
  file: FileInfo;
  size: number;
  hideText?: boolean;
}) {
  const { id, file, size, hideText } = props;
  const {
    rest: { client: apiClient },
  } = useContext(ConfigurationContext);

  const FileName = hideText ? null : (
    <Box
      sx={{
        ml: 1,
        flex: 1,
        overflow: 'hidden',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'break-spaces',
          lineHeight: 1.2,
        }}
        title={`${file.name}${file.extension}`}
      >
        {file.name}
        {file.extension}
      </Typography>
    </Box>
  );

  if (file.contentType.startsWith('image/')) {
    return (
      <>
        <Box sx={{ width: size, height: size }}>
          <Box
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            component="img"
            src={`${apiClient.defaults.baseURL}/files/w_40,c_limit/${id}`}
          />
        </Box>
        {FileName}
      </>
    );
  }

  if (file.contentType.startsWith('video/')) {
    return (
      <>
        <Box sx={{ width: size, height: size }}>
          {getFileIcon(file.extension)}
        </Box>
        {FileName}
      </>
    );
  }

  if (file.contentType.startsWith('audio/')) {
    return (
      <>
        <Box sx={{ width: size, height: size }}>
          {getFileIcon(file.extension)}
        </Box>
        {FileName}
      </>
    );
  }

  return (
    <>
      <Box sx={{ width: size, height: size }}>
        {getFileIcon(file.extension)}
      </Box>
      {FileName}
    </>
  );
}

export default function FileColumn({ value, row, colDef }: FileColumnProps) {
  const {
    rest: { client: apiClient },
    hasura,
    translations,
  } = useContext(ConfigurationContext);
  const [file, setFile] = useState<null | FileInfo>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { hideText, size = 42 } = colDef as BaseDataTableFileColumnDef;

  useEffect(() => {
    if (value == null) {
      setIsLoading(false);
      return;
    }

    (async () => {
      const [data] = await hasura.request({
        type: 'query',
        source: 'file',
        where: { id: { _eq: value } },
        limit: 1,
        selection: 'contentType name extension',
      });

      if (data) {
        setFile(data);
      }

      setIsLoading(false);
    })();
  }, [value]);

  if (isLoading) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: size, height: size }}>
          <Skeleton variant="rectangular" width="100%" height="100%" />
        </Box>
        <Box sx={{ ml: 1, flex: 1 }}>
          <Skeleton sx={{ width: '100%' }} />
        </Box>
      </Box>
    );
  }

  if (!file) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: size, height: size }}>
          <FileHidden sx={{ width: '100%', height: '100%', opacity: 0.1 }} />
        </Box>
        <Box sx={{ ml: 1, flex: 1 }}>
          <Typography variant="caption" sx={{ opacity: 0.4 }}>
            {translations.noFile}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      component="a"
      href={`${apiClient.defaults.baseURL}/files/${value}`}
      target="_blank"
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        color: 'inherit',
        textDecoration: 'none',
        ':hover': {
          textDecoration: 'underline',
        },
      }}
    >
      <FileContent id={value} file={file} size={size} hideText={hideText} />
    </Box>
  );
}
