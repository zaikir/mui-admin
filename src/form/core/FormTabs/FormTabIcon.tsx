import { Badge, Box, Tab } from '@mui/material';
import { useContext, useEffect, useState } from 'react';

import { ConfigurationContext } from 'contexts/ConfigurationContext';

import { FormTabDef } from './FormTabs.types';

type TabProps = React.ComponentProps<typeof Tab>;

export function FormTabIcon(props: {
  icon?: TabProps['icon'];
  badge?: FormTabDef['badge'];
}) {
  const { icon, badge } = props;
  const { hasura } = useContext(ConfigurationContext);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!badge?.subscribe) {
      return;
    }

    const unsubscribe = hasura.subscribe(
      {
        type: 'subscription',
        source: badge.subscribe.source,
        selection: badge.subscribe.selection,
        aggregation: badge.subscribe.aggregation,
        where: badge.subscribe.filter,
      },
      (data) => {
        if (!badge.subscribe) {
          return;
        }

        const value = badge.subscribe.extractCount
          ? badge.subscribe.extractCount(data)
          : data;

        setCount(value);
      },
    );

    return unsubscribe;
  }, [hasura, badge?.subscribe]);

  if (!badge) {
    return (
      <Box component="span" className="MuiTab-iconWrapper">
        {icon}
      </Box>
    );
  }

  return (
    <Badge
      badgeContent={(count ?? badge.count)?.toString()}
      invisible={count === null}
      className="MuiTab-iconWrapper"
      {...badge.badgeProps}
    >
      {icon}
    </Badge>
  );
}
