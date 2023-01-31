import { SxProps } from '@mui/material';

export type FormTabProps = {
  tab: string;
  children?: ((isVisible: boolean) => React.ReactNode) | React.ReactNode;
  sx?: SxProps;
  grid?: boolean;
};
