import { IconButton, Tooltip } from '@mui/material';
import { GridRenderCellParams, GridStateColDef } from '@mui/x-data-grid';
import { useContext, useState } from 'react';

import { ConfigurationContext } from 'contexts/ConfigurationContext';
import { NotificationsContext } from 'contexts/NotificationsContext';

import type { BaseDataTableIconButtonColumnDef } from '../BaseDataTable/BaseDataTable.types';

export type IconButtonColumnProps = GridRenderCellParams<any, any, any>;

type ColDefType = GridStateColDef<any, any, any> &
  BaseDataTableIconButtonColumnDef;

export default function IconButtonColumn({
  row,
  colDef,
}: IconButtonColumnProps) {
  const { icon, tooltip, onClick } = colDef as ColDefType;
  const [isLoading, setIsLoading] = useState(false);
  const configuration = useContext(ConfigurationContext);
  const notifications = useContext(NotificationsContext);

  const { showAlert } = notifications;

  const context = {
    notifications,
    configuration,
  };

  const content = (
    <IconButton
      disabled={!onClick || isLoading}
      onClick={async (event) => {
        event.stopPropagation();
        event.preventDefault();

        try {
          setIsLoading(true);

          if (onClick) {
            await onClick(row, context);
          }
        } catch {
          showAlert(configuration.translations.unexpectedError, 'error');
        } finally {
          setIsLoading(false);
        }
      }}
    >
      {typeof icon === 'function' ? icon(row, context) : icon}
    </IconButton>
  );

  if (!tooltip) {
    return content;
  }

  return (
    <Tooltip
      title={typeof tooltip === 'function' ? tooltip(row, context) : tooltip}
    >
      {content}
    </Tooltip>
  );
}
