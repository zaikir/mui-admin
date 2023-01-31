import type { MenuProps } from '@mui/material';

import type { RowsCustomFilterDef } from '../RowsCustomFilterForm';

export type AddCustomFilterMenuProps = {
  anchorEl: MenuProps['anchorEl'];
  filters: RowsCustomFilterDef[];
  onSelect: (filter: RowsCustomFilterDef) => void;
  onClose: () => void;
};
