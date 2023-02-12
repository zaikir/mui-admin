import { Box, Skeleton, Typography } from '@mui/material';
import { DataGrid, GridColumnTypesRecord } from '@mui/x-data-grid';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ConfigurationContext } from 'contexts/ConfigurationContext';
import { useNavigate } from 'shared/hooks/useNavigate';
import { getGraphqlPath } from 'utils/getGraphqlPath';

import type {
  BaseDataTableProps,
  BaseDataTableRelationshipColumnDef,
  BaseDataTableSelectColumnDef,
  BaseDataTableState,
} from './BaseDataTable.types';
import {
  isValueEmpty,
  parseTableStateFromQuery,
  updateTableStateInQuery,
} from '../../utils';
import { DeleteRowColumn } from '../DeleteRowColumn';
import { EditRowColumn } from '../EditRowColumn';
import { EmailColumn } from '../EmailColumn';
import { FileColumn } from '../FileColumn';
import { IconButtonColumn } from '../IconButtonColumn';
import { NameColumn } from '../NameColumn';
import { NoRowsOverlay } from '../NoRowsOverlay';
import { PhoneColumn } from '../PhoneColumn';
import { RowsFilter, RowsFilterState } from '../RowsFilter';
import { SortColumn } from '../SortColumn';

export default function BaseDataTable(props: BaseDataTableProps) {
  const {
    columns,
    editable,
    deletable,
    rowsPerPageOptions = [50, 100, 250, 500],
    tabsFilter,
    searchFilter,
    customFilter,
    persistStateMode,
    sortBy,
    rows,
    title,
    skeletonLoading,
    persistScrollBar: initialPersistScrollBar,
    filterRowsFunc,
    onInitialized,
    onStateChanged,
    ...rest
  } = props;

  const queryPrefix = 'queryPrefix' in rest ? rest.queryPrefix : undefined;
  const defaultTabId = tabsFilter?.tabs?.[0]
    ? tabsFilter.tabs[0].id ?? '0'
    : '0';
  const persistScrollBar = initialPersistScrollBar ?? false;
  const skeletonWidths = useRef<Record<string, number>>({});

  const { hasura, locale } = useContext(ConfigurationContext);
  const navigate = useNavigate();

  const defaultTableState = useMemo(() => {
    const initialState: BaseDataTableState = {
      tab: defaultTabId,
      filters: {},
      search: '',
      page: 0,
      pageSize: rowsPerPageOptions[0],
      sortModel: sortBy ? [sortBy] : [],
    };

    if (persistStateMode === 'query') {
      // eslint-disable-next-line max-len
      const parsedState: Partial<BaseDataTableState> =
        parseTableStateFromQuery(queryPrefix);

      return {
        ...initialState,
        ...parsedState,
      };
    }

    return initialState;
  }, [defaultTabId, persistStateMode, queryPrefix, rowsPerPageOptions, sortBy]);

  const columnTypes: GridColumnTypesRecord = {
    ...rest.columnTypes,
    phone: {
      width: 150,
      renderCell: (params) => <PhoneColumn {...params} />,
    },
    email: {
      renderCell: (params) => <EmailColumn {...params} />,
    },
    name: {
      renderCell: (params) => <NameColumn {...params} />,
    },
    file: {
      renderCell: (params) => <FileColumn {...params} />,
    },
    date: {
      width: 150,
      valueFormatter(params) {
        const column = columns.find((x) => x.field === params.field);
        if (isValueEmpty(params.value)) {
          return column!.placeholder ?? '—';
        }

        return new Date(params.value).toLocaleDateString();
      },
    },
    dateTime: {
      width: 160,
      valueFormatter(params) {
        const column = columns.find((x) => x.field === params.field);
        if (isValueEmpty(params.value)) {
          return column!.placeholder ?? '—';
        }

        const date = new Date(params.value);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit',
        })}`;
      },
    },
    edit: {
      width: 40,
      minWidth: 40,
      sortable: false,
      headerName: '',
      renderCell: (params) => <EditRowColumn {...params} />,
      ...(editable && typeof editable === 'object' && editable.columnProps),
    },
    delete: {
      width: !persistScrollBar ? 40 : 60,
      sortable: false,
      headerName: '',
      renderCell: (params) => <DeleteRowColumn {...params} />,
      ...(deletable && typeof deletable === 'object' && deletable.columnProps),
    },
    'icon-button': {
      width: !persistScrollBar ? 40 : 60,
      sortable: false,
      headerName: '',
      renderCell: (params) => <IconButtonColumn {...params} />,
    },
    sort: {
      width: 65,
      sortable: false,
      headerName: '',
      renderCell: (params) => <SortColumn {...params} />,
    },
    select: {
      valueGetter(params) {
        const { items } = params.colDef as unknown as Omit<
          BaseDataTableSelectColumnDef,
          'type'
        >;
        return items.find((x) => x.value === params.value)?.text || '—';
      },
    },
    number: {
      align: 'left',
      headerAlign: 'left',
    },
    relationship: {
      valueGetter({ field, row }) {
        const col = columns.find(
          (x) => x.field === field,
        ) as BaseDataTableRelationshipColumnDef & {
          selector?: string;
        };

        const pathToValue = getGraphqlPath(col.selector || field);
        const displayValue = pathToValue.reduce(
          (acc, item) => acc?.[item],
          row as any,
        ) as any;

        return displayValue;
      },
      renderCell({ value, field, row }) {
        const col = columns.find(
          (x) => x.field === field,
        ) as BaseDataTableRelationshipColumnDef & {
          selector?: string;
        };

        const pathToEntity = getGraphqlPath(col.selector || field).slice(0, -1);
        const entity = pathToEntity.reduce(
          (acc, item) => acc?.[item],
          row as any,
        ) as any;

        const isRemoved = col.isRemovedGetter
          ? col.isRemovedGetter(row)
          : !Object.keys(hasura.removeUpdate).find(
              (key) => entity?.[key] !== true,
            );

        return (
          <Box
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              ...(isRemoved && {
                color: '#c00021',
              }),
            }}
          >
            {isValueEmpty(value) ? col!.placeholder ?? '—' : value}
          </Box>
        );
      },
    },
  };

  const [tableState, setTableState] =
    useState<BaseDataTableState>(defaultTableState);

  const allColumns = useMemo<BaseDataTableProps['columns']>(() => {
    const items = columns
      .filter((column) => !column.tabs || column.tabs.includes(tableState.tab))
      .map(({ placeholder, ...column }) => ({
        ...column,
        ...(placeholder !== null &&
          !column.type && {
            valueFormatter:
              column.valueFormatter ??
              ((e) =>
                isValueEmpty(e.value)
                  ? placeholder === false
                    ? ''
                    : '—'
                  : e.value),
          }),
      }));

    const cols = [
      ...(editable
        ? [
            {
              field: '__edit',
              type: 'edit' as const,
              ...(typeof editable === 'object' && editable),
            } as any,
          ]
        : []),
      ...items,
      ...(deletable
        ? [
            {
              field: '__delete',
              type: 'delete' as const,
              ...(typeof deletable === 'object' && deletable),
            } as any,
          ]
        : []),
    ];

    if (!skeletonLoading) {
      return cols;
    }

    return cols.map(({ valueGetter, valueFormatter, ...x }) => ({
      ...x,
      ...(() => {
        const def = columnTypes[x.type];

        return {
          headerName: x.headerName || def?.headerName,
          width: x.width || def?.width || 100,
          minWidth: x.minWidth || def?.minWidth || x.width || def?.width || 100,
        };
      })(),
      type: null,
      field: `skeleton_${x.field}`,
      renderCell(params) {
        if (
          x.type &&
          ['edit', 'delete', 'icon-button', 'sort'].includes(x.type)
        ) {
          return <Skeleton width={20} height={20} variant="rectangular" />;
        }

        const key = `${params.id}_${params.field}`;
        skeletonWidths.current[key] =
          skeletonWidths.current[key] || 50 + Math.random() * 30;

        return <Skeleton width={`${skeletonWidths.current[key]}%`} />;
      },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, editable, deletable, tableState.tab, skeletonLoading]);

  const isFirstRender = useRef(true);
  const prevState = useRef<BaseDataTableState | null>();
  const onStateChangedRef = useRef<typeof onStateChanged>(onStateChanged);

  const onFiltersChange = useCallback((state: RowsFilterState) => {
    setTableState((prev) => ({ ...prev, ...state }));
  }, []);

  useEffect(() => {
    onStateChangedRef.current = onStateChanged;
  }, [onStateChanged]);

  useEffect(() => {
    const fullTableState = tableState;
    if (isFirstRender.current) {
      if (onInitialized) {
        onInitialized(fullTableState);
      }

      prevState.current = fullTableState;
      isFirstRender.current = false;
      return;
    }

    if (JSON.stringify(prevState.current) === JSON.stringify(fullTableState)) {
      return;
    }

    prevState.current = fullTableState;

    if (onStateChangedRef.current) {
      onStateChangedRef.current(fullTableState);
    }

    if (!persistStateMode || persistStateMode === 'none') {
      return;
    }

    if (persistStateMode === 'query') {
      const newSortModel =
        fullTableState.sortModel?.length &&
        (!sortBy ||
          JSON.stringify(sortBy) !==
            JSON.stringify(fullTableState.sortModel[0])) &&
        fullTableState.sortModel[0];

      updateTableStateInQuery(
        {
          ...(fullTableState.page > 0 && { page: fullTableState.page }),
          ...(fullTableState.pageSize !== rowsPerPageOptions[0] && {
            pageSize: fullTableState.pageSize,
          }),
          ...(newSortModel && {
            sortModelField: newSortModel.field,
            sortModelSort: newSortModel.sort,
          }),
          ...(fullTableState.tab !== defaultTabId && {
            tab: fullTableState.tab,
          }),
          ...(fullTableState.search.trim().length > 0 && {
            search: fullTableState.search.trim(),
          }),
          ...(fullTableState.filters &&
            Object.keys(fullTableState.filters).length > 0 && {
              filters: fullTableState.filters,
            }),
        },
        queryPrefix,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableState]);

  const titleNode = (() => {
    if (!title) {
      return null;
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {(typeof title === 'string' ? title : title.title) || ''}
        </Typography>
        {typeof title === 'object' && title?.actionButton
          ? title.actionButton
          : null}
      </Box>
    );
  })();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {titleNode}
      <RowsFilter
        initialState={tableState}
        onChange={onFiltersChange}
        tabsFilter={tabsFilter}
        searchFilter={searchFilter}
        customFilter={customFilter}
      />
      <DataGrid
        {...rest}
        page={tableState.page}
        onPageChange={(newPage, details) => {
          if (skeletonLoading) {
            return;
          }

          setTableState((prev) => ({ ...prev, page: newPage }));

          if (rest.onPageChange) {
            rest.onPageChange(newPage, details);
          }
        }}
        pageSize={tableState.pageSize}
        onPageSizeChange={(newPageSize, details) => {
          if (skeletonLoading) {
            return;
          }

          setTableState((prev) => ({ ...prev, pageSize: newPageSize }));

          if (rest.onPageSizeChange) {
            rest.onPageSizeChange(newPageSize, details);
          }
        }}
        sortModel={tableState.sortModel}
        onSortModelChange={(newSortModel, details) => {
          if (skeletonLoading) {
            return;
          }

          setTableState((prev) => ({ ...prev, sortModel: newSortModel }));

          if (rest.onSortModelChange) {
            rest.onSortModelChange(newSortModel, details);
          }
        }}
        {...(skeletonLoading
          ? {
              rows: [
                ...new Array(
                  typeof skeletonLoading === 'object'
                    ? skeletonLoading.rowsCount
                    : 3,
                ).keys(),
              ].map((id) => ({ id })),
            }
          : {
              rows: filterRowsFunc
                ? rows.filter((row) => filterRowsFunc(row, tableState))
                : rows,
            })}
        columns={allColumns}
        rowsPerPageOptions={rowsPerPageOptions}
        disableSelectionOnClick={rest.disableSelectionOnClick ?? true}
        showColumnRightBorder={rest.showColumnRightBorder ?? false}
        disableColumnMenu={rest.disableColumnMenu ?? true}
        getRowClassName={(params) => {
          const oddEven =
            params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd';
          return (
            oddEven +
            (rest.getRowClassName ? ` ${rest.getRowClassName(params)}` : '')
          );
        }}
        columnTypes={columnTypes}
        disableColumnFilter
        disableDensitySelector
        disableColumnSelector
        onRowDoubleClick={(event, ...other) => {
          // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
          if (editable && editable.onEdit) {
            editable.onEdit(event.row);
          }

          // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
          if (editable && editable.link) {
            navigate(editable.link(event.row));
          }

          if (rest.onRowDoubleClick) {
            rest.onRowDoubleClick(event, ...other);
          }
        }}
        sortingOrder={rest.sortingOrder ?? ['desc', 'asc']}
        pagination
        {...(persistScrollBar && {
          scrollbarSize: 0,
        })}
        headerHeight={rest.headerHeight ?? 48}
        components={{
          NoRowsOverlay: rest.components?.NoRowsOverlay ?? NoRowsOverlay,
          ...rest.components,
        }}
        sx={{
          '.MuiDataGrid-row.odd ': {
            backgroundColor: 'rgb(248, 248, 248)',
          },
          ...(persistScrollBar && {
            '.MuiDataGrid-virtualScroller': {
              overflowY: { xs: 'auto', md: 'scroll' },
              overflowX: { xs: 'auto', md: 'hidden' },
            },
          }),
          ...rest.sx,
        }}
      />
    </Box>
  );
}
