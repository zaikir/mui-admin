import { debounce } from '@mui/material';
import {
  forwardRef,
  Ref,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ConfigurationContext } from 'contexts/ConfigurationContext';
import { getGraphqlPath } from 'utils/getGraphqlPath';

import {
  HasuraDataTableColumnDef,
  HasuraDataTableProps,
} from './HasuraDataTable.types';
import { BaseDataTable } from '../BaseDataTable';
import {
  BaseDataTableState,
  BaseDataTableRef,
} from '../BaseDataTable/BaseDataTable.types';

const HasuraDataTable = forwardRef(
  (
    {
      columns,
      source,
      tabsFilter,
      searchFilter,
      customFilter,
      deleteProps,
      selectProps,
      skeletonRowsCount,
      disableInitialization,
      fetchAll,
      disableRemovedFilter,
      ...rest
    }: HasuraDataTableProps,
    ref: Ref<BaseDataTableRef>,
  ) => {
    const Source = source.charAt(0).toUpperCase() + source.slice(1);

    const { hasura, onSearch } = useContext(ConfigurationContext);
    const [rows, setRows] = useState<any[]>([]);
    const [rowCount, setRowCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const tableState = useRef<BaseDataTableState>();

    const fetchRows = useCallback(async () => {
      const selectSource = selectProps?.source ?? source;
      const SelectSource =
        selectSource.charAt(0).toUpperCase() + selectSource.slice(1);

      setIsLoading(true);

      const state = tableState.current!;

      const onSelectionFunc = selectProps?.onSelection || ((x: any) => x);

      const allSelections = onSelectionFunc([
        hasura.primaryKey,
        ...columns
          .filter((column) => column.selector !== false)
          .filter((column) => !column.tabs || column.tabs.includes(state.tab))
          .map((column) => {
            if (column.fetchRemoved ?? true) {
              return (column.selector || column.field)
                .replace(
                  '*',
                  `${Object.keys(hasura.removeUpdate || {}).join(' ')} *`,
                )
                .replace(/\*/g, '');
            }

            return (column.selector || column.field).replace(/\*/g, '');
          }),
      ]);

      const selections = [...new Set(allSelections)];
      const orderBy =
        state.sortModel?.length &&
        Object.assign(
          {},
          ...state.sortModel.flatMap(({ field, sort }) => {
            const column = columns.find(
              (x) => x.field === field,
            ) as HasuraDataTableColumnDef;
            if (!column || !sort) {
              return [];
            }

            if (column.onSort) {
              return column.onSort(`${sort.toUpperCase()}_NULLS_LAST`);
            }

            const path = getGraphqlPath(column.selector || field);
            const result: Record<string, any> = {};
            let current: Record<string, any> | null = null;

            for (let i = 0; i < path.length; i += 1) {
              const segment = path[i];
              if (!current) {
                current = result;
              }

              if (i === path.length - 1) {
                current[segment] = `${sort.toUpperCase()}_NULLS_LAST`;
              } else {
                current[segment] = {};
                current = current[segment] || {};
              }
            }

            return [result];
          }),
        );

      const defaultFilter = selectProps?.filter;
      const args = selectProps?.functionArgs;
      const filters = !defaultFilter ? [] : [defaultFilter];
      const selectedTab =
        tabsFilter?.tabs &&
        tabsFilter?.tabs.find(
          (x, idx) => (x.id ?? idx.toString()) === state.tab,
        );

      if (selectedTab?.filter) {
        filters.push(selectedTab.filter);
      }

      const searchStrings =
        searchFilter &&
        (state.search?.length || 0) >= (searchFilter.minLength ?? 2) &&
        onSearch(state.search)
          .map((str) =>
            searchFilter.lowerCase ?? true ? str.toLowerCase() : str,
          )
          .map((str) => (searchFilter.trim ?? true ? str.trim() : str));

      if (searchStrings) {
        filters.push(searchFilter.filter(searchStrings));
      }

      const customFilters = !customFilter
        ? []
        : Object.entries(state.filters).map(([key, value]) => {
            const [filterIdx] = key.split('_').map((x) => parseInt(x, 10));
            const filter = customFilter?.filters[filterIdx];

            if (filter?.filter) {
              return filter?.filter(value);
            }

            if (value === null || value === undefined || value === '') {
              return {};
            }

            return {
              [filter.field]: {
                _eq: typeof value === 'string' ? value.trim() : value,
              },
            };
          });

      filters.push(...customFilters);

      if (hasura.filter) {
        filters.push(hasura.filter);
      }

      const where = filters.length > 0 ? { _and: filters } : null;

      const resultOrderBy = (selectProps?.onSort || ((x: any) => x))(
        Object.keys(orderBy || {}).length > 0 && orderBy,
      );

      const { items, total } = await hasura.request(
        {
          type: 'custom',
          query: `
        query ${SelectSource}FetchRows (${
            args ? `$args: ${selectSource}Args!,` : ''
          }$where: ${SelectSource}BoolExp, $orderBy: [${SelectSource}OrderBy!], $limit: Int, $offset: Int) {
          items: ${selectSource}(${
            args ? `args: $args,` : ''
          }where: $where, orderBy: $orderBy, limit: $limit, offset: $offset) {
            ${selections.join(' ')}
          }
          total: ${selectSource}Aggregate(${
            args ? `args: $args,` : ''
          }where: $where) { aggregate { count } }
        }`
            .replace(/\n/g, ' ')
            .replace(/ +/g, ' ')
            .trim(),
          variables: {
            ...(args && { args }),
            where: {
              _and: [
                ...(where ? [where] : []),
                ...(disableRemovedFilter ? [] : [hasura.removedFilter]),
              ],
            },
            ...(resultOrderBy && { orderBy: resultOrderBy }),
            ...(!fetchAll && {
              offset: state.page * state.pageSize,
              limit: state.pageSize,
            }),
          },
        },
        { showRemoved: true },
      );

      setRows(selectProps?.onFetch ? await selectProps?.onFetch(items) : items);
      setRowCount(total.aggregate.count);
      setIsLoading(false);
      setIsInitialLoading(false);

      return { items, total };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source, Source, columns, selectProps, hasura, onSearch]);

    const debouncedFetchRows = useMemo(
      () =>
        debounce(() => {
          fetchRows();
        }, 50),
      [fetchRows],
    );

    const deleteRow = useCallback(
      async (row: any) => {
        const setValues = deleteProps?.setValues || hasura.removeUpdate;
        const deleteAction = deleteProps?.deleteAction;
        const extractKeys =
          deleteProps?.filter ||
          ((item: any) => ({
            [hasura.primaryKey]: { _eq: item[hasura.primaryKey] },
          }));

        if (deleteAction) {
          const success = await deleteAction(row);
          if (success) {
            await fetchRows();
          }

          return;
        }

        await hasura.request({
          type: 'custom',
          query: `
      mutation Remove ($where: ${Source}BoolExp!, $set: ${Source}SetInput!) {
        update${Source} (where: $where, _set: $set) {
          __typename
        }
      }`
            .replace(/\n/g, ' ')
            .replace(/ +/g, ' ')
            .trim(),
          variables: {
            where: extractKeys(row),
            set: setValues,
          },
        });

        await fetchRows();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      },
      [deleteProps, hasura, Source, fetchRows],
    );

    const onInitialized = useCallback(async (state: BaseDataTableState) => {
      tableState.current = state;
      setIsInitialized(true);
    }, []);

    const onTableStateChanged = useCallback(
      async (state: BaseDataTableState) => {
        if (fetchAll) {
          return;
        }

        tableState.current = state;
        await debouncedFetchRows();
      },
      [debouncedFetchRows, fetchAll],
    );

    useImperativeHandle(
      ref,
      () => ({
        async reload() {
          await fetchRows();
        },
      }),
      [fetchRows],
    );

    useEffect(() => {
      if (!isInitialized || disableInitialization === true) {
        return;
      }

      debouncedFetchRows();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [disableInitialization, isInitialized, selectProps?.filter]);

    return (
      <BaseDataTable
        {...rest}
        columns={columns}
        rows={rows}
        {...(!fetchAll && {
          paginationMode: 'server',
          sortingMode: 'server',
          filterMode: 'server',
          rowCount,
        })}
        tabsFilter={tabsFilter}
        searchFilter={searchFilter}
        customFilter={customFilter}
        onInitialized={onInitialized}
        onStateChanged={onTableStateChanged}
        {...(isInitialLoading
          ? {
              skeletonLoading: { rowsCount: skeletonRowsCount || 3 },
            }
          : {
              loading: isLoading,
            })}
        {...(rest.deletable && {
          deletable: {
            ...(typeof rest.deletable !== 'boolean' && rest.deletable),
            deleteFunc: (() => {
              if (typeof rest.deletable === 'boolean') {
                return deleteRow;
              }

              return 'deleteFunc' in rest.deletable
                ? rest.deletable.deleteFunc
                : deleteRow;
            })(),
          },
        })}
      />
    );
  },
);

export default HasuraDataTable;
