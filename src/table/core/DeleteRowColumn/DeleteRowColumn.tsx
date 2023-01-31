import DeleteIcon from '@mui/icons-material/Delete';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { CircularProgress, IconButton, Tooltip } from '@mui/material';
import { GridRenderCellParams, GridStateColDef } from '@mui/x-data-grid';
import { useContext, useMemo, useState } from 'react';

import { ConfigurationContext } from 'contexts/ConfigurationContext';
import { NotificationsContext } from 'contexts/NotificationsContext';

import { PromiseOrValue } from '../../../';
import { ShowAlertProps } from '../ConfirmDialog';

type ColDefType = GridStateColDef<any, any, any> & {
  confirm?: ShowAlertProps;
  isEnabled?: (row: any) => boolean;
  deleteFunc?: (row: any) => PromiseOrValue<void>;
  onDeleted?: (row: any) => PromiseOrValue<void>;
};

export type DeleteRowColumnProps = GridRenderCellParams<any, any, any>;

export default function DeleteRowColumn({ row, colDef }: DeleteRowColumnProps) {
  const { confirm, isEnabled, deleteFunc, onDeleted } = colDef as ColDefType;
  const { defaultDeleteConfirm, alerts, translations } =
    useContext(ConfigurationContext);
  const { showConfirm, showAlert } = useContext(NotificationsContext);
  const [isLoading, setIsLoading] = useState(false);

  const isDeleteEnabled = useMemo(() => {
    if (!isEnabled) {
      return true;
    }

    return isEnabled(row);
  }, [isEnabled, row]);

  const onClick = async () => {
    try {
      const confirmProps = confirm ?? defaultDeleteConfirm;

      if (confirmProps) {
        const success = await showConfirm(confirmProps);

        if (!success) {
          return;
        }
      }

      setIsLoading(true);

      if (deleteFunc) {
        await deleteFunc(row);
      } else {
        // eslint-disable-next-line no-console
        console.error('deleteFunc is not provided');
      }

      if (onDeleted) {
        await onDeleted(row);
      }

      showAlert(
        alerts.snackbars.entityDeleted.text,
        alerts.snackbars.entityDeleted.variant,
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      showAlert(translations.unexpectedError, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tooltip title={translations.deleteTableRow}>
      <span>
        <IconButton
          onClick={onClick}
          disabled={isLoading || !isDeleteEnabled}
          sx={{
            '& .idle': { display: 'flex' },
            '& .hover': { display: 'none' },
            '&:hover .idle': { display: 'none' },
            '&:hover .hover': { display: 'flex' },
          }}
        >
          {isLoading ? (
            <CircularProgress size={16} />
          ) : (
            <>
              <DeleteIcon className="idle" />
              <DeleteForeverIcon className="hover" color="error" />
            </>
          )}
        </IconButton>
      </span>
    </Tooltip>
  );
}
