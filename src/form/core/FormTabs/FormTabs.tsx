import { Box, Tab, Tabs, tabsClasses } from '@mui/material';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { NotificationsContext } from 'contexts/NotificationsContext';
import {
  FormTabsContext,
  FormTabsContextType,
} from 'form/contexts/FormTabsContext';
import {
  parseFormTabsStateFromQuery,
  updateFormTabsStateInQuery,
} from 'form/utils/formTabsPersistenceUtils';

import { FormTabDef, FormTabsProps } from './FormTabs.types';
import { FormErrorsListener } from '../FormErrorsListener';

export default function FormTabs({
  tabs,
  tabProps,
  tabsProps,
  tabsWrapperStyle,
  persistStateMode,
  children,
  ...rest
}: FormTabsProps) {
  const firstTabId = tabs[0] ? tabs[0].id || '0' : '0';

  const initialTab = (() => {
    if (persistStateMode === 'query') {
      const queryPrefix = 'queryPrefix' in rest ? rest.queryPrefix : undefined;
      const { tab } = parseFormTabsStateFromQuery(queryPrefix);

      return tab ?? firstTabId;
    }

    return firstTabId;
  })() as string;
  const { showAlert } = useContext(NotificationsContext);
  const [tab, setTab] = useState<string>(initialTab);
  const errorsRef = useRef<{ name: string; text?: string }[]>([]);
  const fields = useRef<{ name: string; tab: string }[]>([]);

  const tabsWithIds = useMemo<(FormTabDef & { id: number | string })[]>(
    () => tabs.map((x, idx) => ({ ...x, id: x.id || idx.toString() })),
    [tabs],
  );

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const register = useCallback((name: string, tab: string) => {
    if (!fields.current.find((x) => x.name === name)) {
      fields.current.push({ name, tab });
    }
  }, []);

  const unregister = useCallback((name: string) => {
    if (!fields.current.find((x) => x.name === name)) {
      fields.current.splice(
        fields.current.findIndex((x) => x.name === name),
        1,
      );
    }
  }, []);

  const tabsContextData = useMemo<FormTabsContextType>(
    () => ({
      tab,
      setTab,
      register,
      unregister,
    }),
    [tab, setTab, register, unregister],
  );

  const handleTabChange = (newTab: string) => {
    setTab(newTab);

    if (tabsProps?.onChange) {
      tabsProps.onChange(null as any, newTab);
    }

    if (persistStateMode === 'query') {
      const queryPrefix = 'queryPrefix' in rest ? rest.queryPrefix : undefined;

      updateFormTabsStateInQuery(
        {
          ...(newTab !== firstTabId && { tab: newTab }),
        },
        queryPrefix,
      );
    }
  };

  useEffect(() => {
    if (tabsProps?.onChange) {
      tabsProps.onChange(null as any, initialTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FormTabsContext.Provider value={tabsContextData}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          pb: 3,
          alignItems: 'center',
          ...tabsWrapperStyle,
        }}
      >
        <Tabs
          {...tabsProps}
          variant={tabsProps?.variant ?? 'scrollable'}
          allowScrollButtonsMobile={tabsProps?.allowScrollButtonsMobile ?? true}
          value={tab}
          onChange={(event, newTab) => {
            handleTabChange(newTab);
          }}
          sx={{
            px: 0,
            [`& .${tabsClasses.scrollButtons}`]: {
              '&.Mui-disabled': { opacity: 0.3 },
            },
            ...tabsProps?.sx,
          }}
        >
          {tabsWithIds.map(({ id, label, icon }) => (
            <Tab
              {...tabProps}
              key={id}
              value={id}
              label={label}
              icon={icon}
              iconPosition={tabProps?.iconPosition ?? 'start'}
              sx={{
                height: 48,
                minHeight: 48,
                pl: { xs: 0, md: 0.5 },
                pr: { xs: 0, md: 1 },
                ...tabProps?.sx,
              }}
            />
          ))}
        </Tabs>
      </Box>
      <FormErrorsListener
        onErrors={(errors) => {
          errorsRef.current = errors;
        }}
        onSubmit={() => {
          const errorsWithTab = errorsRef.current.flatMap((error) => {
            const field = fields.current.find((x) => x.name === error.name);
            if (!field) {
              return [];
            }

            return {
              tab: field.tab,
              ...error,
            };
          });

          if (!errorsWithTab.length) {
            return;
          }

          if (errorsWithTab.find((x) => x.tab === tab)) {
            return;
          }

          handleTabChange(errorsWithTab[0].tab);
          showAlert(errorsWithTab[0].text ?? 'Error', 'error');
        }}
      />
      {children}
    </FormTabsContext.Provider>
  );
}
