import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import { RowsFilterProps } from './RowsFilter.types';
import { AddCustomFilterButton } from '../AddCustomFilterButton';
import {
  RowsCustomFilterForm,
  RowsCustomFilterInput,
} from '../RowsCustomFilterForm';
import { RowsSearchFilter } from '../RowsSearchFilter';
import { RowsTabsFilter } from '../RowsTabsFilter';

export default function RowsFilter({
  initialState,
  onChange,
  tabsFilter,
  searchFilter,
  customFilter,
  slots,
}: RowsFilterProps) {
  const [tab, setTab] = useState<string>(initialState.tab);
  const [search, setSearch] = useState<string>(initialState.search);
  // eslint-disable-next-line max-len
  const [customFilterValue, setCustomFilterValue] = useState<
    Record<string, any>
  >(initialState.filters);

  const [customFilterInputs, setCustomFilterInputs] = useState<
    RowsCustomFilterInput[]
  >(
    Object.entries(initialState.filters)
      .map(([key]) => key.split('_').map((x) => parseInt(x, 10)))
      .sort((a, b) => a[1] - b[1])
      .flatMap(([filterIdx, inputIdx]) => {
        const filter = customFilter?.filters[filterIdx];

        if (!filter) {
          // eslint-disable-next-line no-console
          console.error('Wrong filter index');
          return [];
        }

        return [{ ...filter, id: `${filterIdx}_${inputIdx}` }];
      }),
  );

  const isFirstRender = useRef(true);

  const isCustomFilterEnabled = !!customFilter?.filters.length;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    onChange({
      tab,
      search,
      filters: customFilterValue,
    });
  }, [tab, search, customFilterValue, onChange]);

  const FiltersButton = isCustomFilterEnabled && (
    <AddCustomFilterButton
      filters={customFilter.filters}
      onSelect={(filter) => {
        const filterIdx = customFilter.filters.indexOf(filter);
        const inputIdx = customFilterInputs.length;

        setCustomFilterInputs([
          ...customFilterInputs,
          {
            id: `${filterIdx}_${inputIdx}`,
            ...filter,
          },
        ]);
      }}
      buttonProps={customFilter.addFilterButtonProps}
    />
  );

  const searchFilterContent = searchFilter && (
    <RowsSearchFilter
      {...searchFilter}
      value={search}
      onChange={(val) => {
        setSearch(val);

        if (searchFilter.onChange) {
          searchFilter.onChange(val);
        }
      }}
      slots={{
        beforeSearch: searchFilter.slots?.beforeSearch ?? slots?.beforeSearch,
        afterSearch: searchFilter.slots?.afterSearch ?? slots?.afterSearch,
      }}
      {...(FiltersButton && { FiltersButton })}
    />
  );

  return (
    <>
      {tabsFilter && (
        <RowsTabsFilter
          {...tabsFilter}
          value={tab}
          onChange={setTab}
          actionButton={
            // eslint-disable-next-line no-nested-ternary
            tabsFilter.actionButton ? (
              tabsFilter.actionButton
            ) : !searchFilter?.position || searchFilter?.position === 'tabs' ? (
              <Box sx={{ flex: 1, pl: 2, mb: -1 }}>{searchFilterContent}</Box>
            ) : null
          }
        />
      )}
      {(searchFilter?.position === 'full' ||
        ((searchFilter?.position ?? 'tabs') === 'tabs' && !tabsFilter)) &&
        searchFilterContent}
      {customFilter && customFilterInputs.length > 0 && (
        <RowsCustomFilterForm
          value={customFilterValue}
          onChange={(newObj) => {
            // customFilterInputs[0].type === 'date'
            setCustomFilterValue(
              Object.fromEntries(
                Object.entries(newObj).flatMap(([key, value]) => {
                  if (value === 'Invalid Date') {
                    return [];
                  }

                  return [[key, value]];
                }),
              ),
            );
          }}
          inputs={customFilterInputs}
          onDeleteInput={(input) => {
            setCustomFilterInputs(
              customFilterInputs.filter((x) => x !== input),
            );

            const temp = { ...customFilterValue };
            delete temp[input.id];
            setCustomFilterValue(temp);
          }}
        />
      )}
    </>
  );
}
