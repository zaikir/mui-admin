import { Paper } from '@mui/material';

type PaperProps = React.ComponentProps<typeof Paper>;

export type BasePageLayoutProps = {
  title?: string | React.ReactNode;
  children: React.ReactNode;
  actionContent?: React.ReactNode;
  paperProps?: PaperProps;
};
