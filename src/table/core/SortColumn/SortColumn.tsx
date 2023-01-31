import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Box, IconButton } from '@mui/material';
import { GridRenderCellParams, GridStateColDef } from '@mui/x-data-grid';
import { useContext, useMemo, useState } from 'react';

import { ConfigurationContext } from 'contexts/ConfigurationContext';
import { NotificationsContext } from 'contexts/NotificationsContext';

import type { BaseDataTableSortColumnDef } from '../BaseDataTable/BaseDataTable.types';

export type IconButtonColumnProps = GridRenderCellParams<any, any, any>;

type ColDefType = GridStateColDef<any, any, any> & BaseDataTableSortColumnDef;

export default function SortColumn({ row, colDef }: IconButtonColumnProps) {
  const {
    sortKey = 'sort',
    rowsSortValues,
    onSortChange,
  } = colDef as ColDefType;
  const [isLoading, setIsLoading] = useState(false);
  const configuration = useContext(ConfigurationContext);
  const notifications = useContext(NotificationsContext);
  const { showAlert } = notifications;

  const sortedRowsSortValues = useMemo(
    () => rowsSortValues && rowsSortValues.sort((a, b) => a - b),
    [rowsSortValues],
  );

  const handleClick = async (direction: 'up' | 'down') => {
    try {
      setIsLoading(true);

      if (onSortChange) {
        const rowIdx = sortedRowsSortValues!.findIndex(
          (x) => x === row[sortKey],
        );
        const targetRow =
          sortedRowsSortValues &&
          sortedRowsSortValues[rowIdx + (direction === 'up' ? -1 : 1)];
        await onSortChange(direction, row, targetRow!, {
          configuration,
          notifications,
        });
      }
    } catch (err) {
      showAlert(configuration.translations.unexpectedError, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <IconButton
        size="small"
        sx={{ height: 16, mb: 0.2 }}
        disabled={
          !sortedRowsSortValues ||
          sortedRowsSortValues[0] === row[sortKey] ||
          isLoading
        }
        onClick={() => handleClick('up')}
      >
        <ArrowUpwardIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        sx={{ height: 16, mt: 0.2 }}
        disabled={
          !sortedRowsSortValues ||
          sortedRowsSortValues[sortedRowsSortValues.length - 1] ===
            row[sortKey] ||
          isLoading
        }
        onClick={() => handleClick('down')}
      >
        <ArrowDownwardIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
