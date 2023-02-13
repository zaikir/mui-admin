import { Box } from '@mui/material';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { useContext } from 'react';

import { ConfigurationContext } from 'contexts/ConfigurationContext';
import { NotificationsContext } from 'contexts/NotificationsContext';

export type ColorColumnProps = GridRenderCellParams<any, any, any>;

export default function ColorColumn({ value, row, colDef }: ColorColumnProps) {
  const { translations } = useContext(ConfigurationContext);
  const { showAlert } = useContext(NotificationsContext);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
      {...(value && {
        component: 'button',
        onClick: () => {
          navigator.clipboard.writeText(value);
          showAlert(translations.copied);
        },
      })}
    >
      <Box
        sx={{
          mr: 1,
          width: 28,
          height: 28,
          borderRadius: 0.5,
          bgcolor: value || 'white',
          border: 'thin solid #cccccc',
          ...(!value && {
            backgroundImage: `linear-gradient(45deg, #ddd 25%, transparent 25%, transparent 50%, #ddd 50%, #ddd 75%, transparent 75%, #fff)`,
            backgroundSize: `7px 7px`,
          }),
        }}
      />
      <Box component="span" sx={{ ...(!value && { opacity: 0.5 }) }}>
        {!value ? translations.notSet : value}
      </Box>
    </Box>
  );
}
