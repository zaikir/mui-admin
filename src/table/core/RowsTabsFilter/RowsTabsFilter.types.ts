import { Box, Tabs, Tab } from '@mui/material';

type BoxProps = React.ComponentProps<typeof Box>;
type TabsProps = React.ComponentProps<typeof Tabs>;
type TabProps = React.ComponentProps<typeof Tab>;

export type DataTableTabFilter = {
  id?: string;
  label: string;
};

export type RowsTabsFilterProps<
  TabFilter extends DataTableTabFilter = DataTableTabFilter,
> = {
  value: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
  tabs: TabFilter[];
  wrapperProps?: BoxProps;
  tabsProps?: Omit<TabsProps, 'value'>;
  tabProps?: Omit<TabProps, 'id' | 'label'>;
  actionButton?: React.ReactNode;
  leftSlot?: React.ReactNode;
};
