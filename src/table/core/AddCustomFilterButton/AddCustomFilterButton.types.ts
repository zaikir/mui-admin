import { IconButton } from '@mui/material';

import type { RowsCustomFilterDef } from '../RowsCustomFilterForm';

type IconButtonProps = React.ComponentProps<typeof IconButton>;

export type AddCustomFilterButtonProps<
  CustomFilter extends RowsCustomFilterDef = RowsCustomFilterDef,
> = {
  filters: CustomFilter[];
  onSelect: (filter: RowsCustomFilterDef) => void;
  buttonProps?: IconButtonProps;
};
