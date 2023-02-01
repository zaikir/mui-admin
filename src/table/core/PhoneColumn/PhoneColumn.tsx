import { Box, useMediaQuery, useTheme } from '@mui/material';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { useContext } from 'react';

import { ConfigurationContext } from 'contexts/ConfigurationContext';
import { NotificationsContext } from 'contexts/NotificationsContext';

import { formatPhone } from '../../utils/formatPhone';
import { isValueEmpty } from '../../utils/isValueEmpty';
import { BaseDataTableColumnDef } from '../BaseDataTable';

export type PhoneColumnProps = GridRenderCellParams<any, any, any>;

export default function PhoneColumn({ value, colDef }: PhoneColumnProps) {
  const theme = useTheme();
  const { translations } = useContext(ConfigurationContext);
  const { showAlert } = useContext(NotificationsContext)!;
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const column = colDef as BaseDataTableColumnDef;

  if (isValueEmpty(value)) {
    return <span>{column.placeholder ?? '—'}</span>;
  }

  return (
    <Box
      {...(isSmallScreen && { component: 'a' })}
      sx={{
        textDecoration: 'none',
        '&:hover': { textDecoration: 'underline' },
        color: 'inherit',
        cursor: 'pointer',
      }}
      {...(isSmallScreen
        ? {
            href: `tel://+${value}`,
            itemProp: 'telephone',
          }
        : {
            onClick: () => {
              navigator.clipboard.writeText(formatPhone(value));
              showAlert(translations.copied);
            },
          })}
    >
      {formatPhone(value)}
    </Box>
  );
}
