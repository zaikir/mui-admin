import { Box } from '@mui/material';
import { GridRenderCellParams } from '@mui/x-data-grid';

import { isValueEmpty } from '../../utils/isValueEmpty';
import { BaseDataTableColumnDef } from '../BaseDataTable';

export type EmailColumnProps = GridRenderCellParams<any, any, any>;

export default function EmailColumn({ value, colDef }: EmailColumnProps) {
  const column = colDef as BaseDataTableColumnDef;

  if (isValueEmpty(value)) {
    return <span>{column.placeholder ?? '—'}</span>;
  }

  return (
    <Box
      component="a"
      sx={{
        textDecoration: 'none',
        '&:hover': { textDecoration: 'underline' },
        color: 'inherit',
      }}
      href={`mailto://+${value}`}
      itemProp="email"
    >
      {value}
    </Box>
  );
}
