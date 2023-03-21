import { Box, IconButton, Menu, MenuItem } from '@mui/material';
import { GridFooter } from '@mui/x-data-grid-pro';
import { Cog } from 'mdi-material-ui';
import { useContext, useState } from 'react';

import { ConfigurationContext } from 'contexts/ConfigurationContext';

export function CustomGridFooter({ resetTableState }: any) {
  const { translations } = useContext(ConfigurationContext);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <GridFooter
        sx={{
          '.MuiTablePagination-spacer': {
            display: 'none',
          },
        }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto', mr: 1 }}>
        <IconButton onClick={handleClick}>
          <Cog />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <MenuItem
            onClick={() => {
              resetTableState();
              handleClose();
            }}
          >
            {translations.resetTableState}
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
