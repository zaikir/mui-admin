import { Box, Tab, Tabs } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { FormTabIcon } from 'form/core/FormTabs/FormTabIcon';

import {
  DataTableTabFilter,
  RowsTabsFilterProps,
} from './RowsTabsFilter.types';

export default function RowsTabsFilter({
  value,
  onChange,
  tabs,
  wrapperProps,
  tabsProps,
  tabProps,
  actionButton,
  leftSlot,
}: RowsTabsFilterProps) {
  const tabsWithIds = useMemo<(DataTableTabFilter & { id: number | string })[]>(
    () => tabs.map((tab, idx) => ({ ...tab, id: tab.id || idx.toString() })),
    [tabs],
  );

  useEffect(() => {
    if (tabsProps?.onChange) {
      tabsProps.onChange(null as any, value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      {...wrapperProps}
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        pb: 1,
        alignItems: 'center',
        ...wrapperProps?.sx,
      }}
    >
      {leftSlot}
      <Tabs
        {...tabsProps}
        variant={tabsProps?.variant ?? 'scrollable'}
        allowScrollButtonsMobile={tabsProps?.allowScrollButtonsMobile ?? true}
        value={value}
        onChange={(event, tab) => {
          onChange(tab);

          if (tabsProps?.onChange) {
            tabsProps.onChange(event, tab);
          }
        }}
        sx={{ px: tabsProps?.scrollButtons ? 0 : 0, ...tabsProps?.sx }}
      >
        {tabsWithIds.map((tab) => (
          <Tab
            {...tabProps}
            {...tab}
            key={tab.id}
            value={tab.id}
            label={tab.label}
            icon={tab.icon && <FormTabIcon icon={tab.icon} badge={tab.badge} />}
            sx={{
              pl: { xs: 0, md: 0.25 },
              pr: { xs: 0, md: 0.5 },
              ...tabProps?.sx,
              ...(tab?.sx as any),
            }}
          />
        ))}
      </Tabs>
      {actionButton}
    </Box>
  );
}
