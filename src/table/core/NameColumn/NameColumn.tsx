import { Box } from '@mui/material';
import { GridRenderCellParams } from '@mui/x-data-grid';
import dayjs from 'dayjs';

import { isValueEmpty } from '../../utils/isValueEmpty';
import { BaseDataTableNameColumnDef } from '../BaseDataTable';

export type NameColumnProps = GridRenderCellParams<any, any, any>;

export default function NameColumn({ value, row, colDef }: NameColumnProps) {
  const { activeDateKey, dateThreshold, placeholder, dotColor } =
    colDef as BaseDataTableNameColumnDef;

  const dotColorFunc =
    dotColor ??
    ((row: any) => {
      const lastActiveDate =
        activeDateKey &&
        (typeof activeDateKey === 'function'
          ? activeDateKey(row)
          : row[activeDateKey]);

      if (!lastActiveDate) {
        return 'red';
      }

      const threshold = dayjs(lastActiveDate)
        .add(dateThreshold ?? 3, 'days')
        .toDate();

      return threshold > new Date() ? 'green' : 'red';
    });

  const dotColorValue = dotColorFunc(row);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        fontWeight: '500',
      }}
    >
      <Box
        sx={{
          mr: 1,
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: dotColorValue === 'red' ? 'red' : '#3ed23e',
        }}
      />
      {isValueEmpty(value) ? placeholder ?? '—' : value}
    </Box>
  );
}
