import {
  Box,
  Skeleton,
  Typography,
  debounce,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { GridColumnTypesRecord } from '@mui/x-data-grid';
import { DataGridPro, GridColumnMenu } from '@mui/x-data-grid-pro';
import { ArrowSplitVertical } from 'mdi-material-ui';
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
import { CustomGridFooter } from './BaseDataTableFooter';
import {
  isValueEmpty,
  parseTableStateFromQuery,
  updateTableStateInQuery,
} from '../../utils';
import { ColorColumn } from '../ColorColumn';
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
import { TranslationColumn } from '../TranslationColumn';

export default function BaseDataTable(props: BaseDataTableProps) {
  const {
    id,
    columns,
    editable,
    deletable,
    pageSizeOptions = [50, 100, 250, 500],
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
  const [reset, setReset] = useState(false);

  const { store, hasura, locale, translations } =
    useContext(ConfigurationContext);
  const navigate = useNavigate();

  const defaultTableState = useMemo(() => {
    const initialState: BaseDataTableState = {
      tab: defaultTabId,
      filters: {},
      search: '',
      page: 0,
      pageSize: pageSizeOptions[0],
      sortModel: sortBy ? [sortBy] : [],
      persistPageSize: {},
      persistSortModel: {},
      visibility: {},
      columnSize: {},
      pinnedColumns: {},
      columnsOrder: {},
    };

    const savedState = store.getItem(`prefs_${id}`) || {};

    const state: BaseDataTableState = {
      ...initialState,
      ...savedState,
    };

    if (persistStateMode === 'query') {
      // eslint-disable-next-line max-len
      const parsedState: Partial<BaseDataTableState> =
        parseTableStateFromQuery(queryPrefix);

      const tab = parsedState.tab ?? state.tab;

      return {
        ...state,
        ...parsedState,
        pageSize:
          parsedState.pageSize ??
          state.persistPageSize?.[tab] ??
          pageSizeOptions[0],
        sortModel:
          parsedState.sortModel ??
          state.persistSortModel?.[tab] ??
          (sortBy ? [sortBy] : []),
      } as BaseDataTableState;
    }

    return state;
  }, [defaultTabId, persistStateMode, queryPrefix, pageSizeOptions, sortBy]);

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
      width: 200,
      renderCell: (params) => <FileColumn {...params} />,
    },
    color: {
      renderCell: (params) => <ColorColumn {...params} />,
    },
    translation: {
      sortable: false,
      renderCell: (params) => <TranslationColumn {...params} />,
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
      resizable: false,
      disableColumnMenu: true,
      headerName: '',
      renderCell: (params) => <EditRowColumn {...params} />,
      ...(editable && typeof editable === 'object' && editable.columnProps),
    },
    delete: {
      width: !persistScrollBar ? 40 : 60,
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      headerName: '',
      renderCell: (params) => <DeleteRowColumn {...params} />,
      ...(deletable && typeof deletable === 'object' && deletable.columnProps),
    },
    'icon-button': {
      width: !persistScrollBar ? 40 : 60,
      sortable: false,
      headerName: '',
      resizable: false,
      disableColumnMenu: true,
      renderCell: (params) => <IconButtonColumn {...params} />,
    },
    sort: {
      width: 65,
      sortable: false,
      headerName: '',
      resizable: false,
      disableColumnMenu: true,
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

    let cols = [
      ...(editable
        ? [
            {
              field: '__edit',
              type: 'edit' as const,
              ...(typeof editable === 'object' && editable),
              sort: -1,
              resizable: false,
              disableColumnMenu: true,
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
              sort: Number.MAX_SAFE_INTEGER,
              resizable: false,
              disableColumnMenu: true,
            } as any,
          ]
        : []),
    ];

    if (tableState.columnsOrder?.[tableState.tab]?.length) {
      cols = cols
        .map((x) => ({
          ...x,
          sort:
            x.sort ??
            tableState.columnsOrder?.[tableState.tab].indexOf(x.field),
        }))
        .sort((a, b) => a.sort - b.sort);
    }

    if (!skeletonLoading) {
      return cols.map((col) => {
        const def = columnTypes?.[col.type];
        const size = tableState.columnSize?.[tableState.tab]?.[col.field] ??
          col?.width ??
          def?.width ?? { flex: 1 };

        return {
          // flex: 1,
          ...def,
          ...col,
          ...(typeof size === 'number'
            ? { width: size, flex: 0 }
            : { flex: undefined, ...size }),
        };
      });
    }

    return cols
      .filter((x) => tableState.visibility?.[tableState.tab]?.[x.field] ?? true)
      .map(({ valueGetter, valueFormatter, ...x }) => ({
        ...x,
        ...(() => {
          const def = columnTypes?.[x.type];
          const size = tableState.columnSize?.[tableState.tab]?.[x.field] ??
            x?.width ??
            def?.width ?? { flex: 1 };

          return {
            headerName: x.headerName || def?.headerName,
            width: x.width || def?.width || 100,
            ...(typeof size === 'number'
              ? { width: size, flex: 0 }
              : { flex: undefined, ...size }),
            minWidth:
              x.minWidth ||
              def?.minWidth ||
              // @ts-ignore
              size?.width ||
              x.width ||
              def?.width ||
              100,
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
  }, [
    columns,
    editable,
    deletable,
    tableState.tab,
    skeletonLoading,
    tableState.columnSize,
    tableState.columnsOrder,
  ]);

  const isFirstRender = useRef(true);
  const prevQueryState = useRef<Partial<BaseDataTableState> | null>();
  const prevPersistState = useRef<Partial<BaseDataTableState> | null>();
  const onStateChangedRef = useRef<typeof onStateChanged>(onStateChanged);

  const onColumnResize = useMemo(
    () =>
      debounce((params, event, details) => {
        setTableState((prev) => ({
          ...prev,
          columnSize: {
            ...prev.columnSize,
            [prev.tab]: {
              ...prev.columnSize?.[tableState.tab],
              [params.colDef.field]: { width: params.width },
            },
          },
        }));

        if (rest.onColumnResize) {
          rest.onColumnResize(params, event, details);
        }
      }, 200),
    [],
  );

  const onFiltersChange = useCallback((state: RowsFilterState) => {
    setTableState((prev) => ({ ...prev, ...state }));
  }, []);

  useEffect(() => {
    onStateChangedRef.current = onStateChanged;
  }, [onStateChanged]);

  useEffect(() => {
    const fullTableState = tableState;

    const currentQueryState = {
      filters: fullTableState.filters,
      page: fullTableState.page,
      pageSize: fullTableState.pageSize,
      search: fullTableState.search,
      sortModel: fullTableState.sortModel,
      tab: fullTableState.tab,
    };

    const currentPersistState = {
      columnSize: fullTableState.columnSize,
      visibility: fullTableState.visibility,
      persistPageSize: fullTableState.persistPageSize,
      persistSortModel: fullTableState.persistSortModel,
      pinnedColumns: fullTableState.pinnedColumns,
      columnsOrder: fullTableState.columnsOrder,
    };

    if (isFirstRender.current) {
      if (onInitialized) {
        onInitialized(fullTableState);
      }

      prevQueryState.current = currentQueryState;
      prevPersistState.current = currentPersistState;

      isFirstRender.current = false;
      return;
    }

    const isQueryStateChanged =
      JSON.stringify(prevQueryState.current) !==
      JSON.stringify(currentQueryState);
    const isPersistStateChanged =
      JSON.stringify(prevPersistState.current) !==
      JSON.stringify(currentPersistState);

    if (!isQueryStateChanged && !isPersistStateChanged) {
      return;
    }

    (() => {
      if (!isQueryStateChanged) {
        return;
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
            ...(fullTableState.pageSize !== pageSizeOptions[0] && {
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

      prevQueryState.current = fullTableState;
    })();

    (() => {
      if (!isPersistStateChanged) {
        return;
      }

      store.setItem(`prefs_${id}`, currentPersistState);
      prevPersistState.current = currentPersistState;
    })();

    if (onStateChangedRef.current) {
      onStateChangedRef.current(fullTableState);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableState]);

  useEffect(() => {
    setReset(false);
  }, [reset]);

  useEffect(() => {
    setReset(true);
  }, [tableState.tab]);

  if (reset) {
    return null;
  }

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
      <DataGridPro
        {...rest}
        paginationModel={{
          page: tableState.page,
          pageSize: tableState.pageSize,
        }}
        onPaginationModelChange={(model, details) => {
          if (skeletonLoading) {
            return;
          }

          setTableState((prev) => ({
            ...prev,
            page: model.page,
            pageSize: model.pageSize,
            persistPageSize: { [prev.tab]: model.pageSize },
          }));

          if (rest.onPaginationModelChange) {
            rest.onPaginationModelChange(model, details);
          }
        }}
        columnVisibilityModel={tableState.visibility?.[tableState.tab]}
        onColumnVisibilityModelChange={(model, details) => {
          if (skeletonLoading) {
            return;
          }

          setTableState((prev) => ({
            ...prev,
            visibility: {
              ...prev.visibility,
              [prev.tab]: model,
            },
          }));

          if (rest.onColumnVisibilityModelChange) {
            rest.onColumnVisibilityModelChange(model, details);
          }
        }}
        onColumnWidthChange={onColumnResize}
        pinnedColumns={tableState.pinnedColumns?.[tableState.tab]}
        onPinnedColumnsChange={(pinnedColumns, details) => {
          if (skeletonLoading) {
            return;
          }

          setTableState((prev) => ({
            ...prev,
            pinnedColumns: {
              ...prev.pinnedColumns,
              [prev.tab]: pinnedColumns,
            },
          }));

          if (rest.onPinnedColumnsChange) {
            rest.onPinnedColumnsChange(pinnedColumns, details);
          }
        }}
        onColumnOrderChange={(params, event, details) => {
          setTableState((prev) => {
            const columns = allColumns;

            const currentOrder = prev.columnsOrder[prev.tab]
              ? [...prev.columnsOrder[prev.tab]]
              : columns.map((x) => x.field);

            [currentOrder[params.oldIndex], currentOrder[params.targetIndex]] =
              [currentOrder[params.targetIndex], currentOrder[params.oldIndex]];

            return {
              ...prev,
              columnsOrder: {
                ...prev.columnsOrder,
                [prev.tab]: currentOrder,
              },
            };
          });
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
        columns={allColumns as any}
        pageSizeOptions={pageSizeOptions}
        disableRowSelectionOnClick={rest.disableRowSelectionOnClick ?? true}
        getRowClassName={(params) => {
          const oddEven =
            params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd';

          return (
            oddEven +
            (rest.getRowClassName ? ` ${rest.getRowClassName(params)}` : '')
          );
        }}
        disableColumnFilter={rest.disableColumnFilter ?? true}
        disableDensitySelector={rest.disableDensitySelector ?? true}
        // disableColumnMenu
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
        pagination={rest.pagination ?? true}
        sx={{
          '.MuiDataGrid-menuIcon > .MuiButtonBase-root': {
            marginRight: '10px',
          },
          '.MuiDataGrid-row.odd ': {
            backgroundColor: 'rgb(248, 248, 248)',
          },
          '.MuiDataGrid-cell:focus, .MuiDataGrid-columnHeader:focus, .MuiDataGrid-columnHeaderTitleContainer, .MuiDataGrid-columnHeader':
            {
              outline: 'none !important',
            },
          ...(persistScrollBar && {
            '.MuiDataGrid-virtualScroller': {
              overflowY: { xs: 'auto', md: 'scroll' },
              overflowX: { xs: 'auto', md: 'hidden' },
            },
          }),
          ...rest.sx,
        }}
        /* Table state */
        sortModel={tableState.sortModel}
        onSortModelChange={(newSortModel, details) => {
          if (skeletonLoading) {
            return;
          }

          setTableState((prev) => ({
            ...prev,
            sortModel: newSortModel,
            persistSortModel: { [prev.tab]: newSortModel },
          }));

          if (rest.onSortModelChange) {
            rest.onSortModelChange(newSortModel, details);
          }
        }}
        slots={{
          noRowsOverlay: NoRowsOverlay,
          footer: CustomGridFooter,
          columnMenu: (props: any) => (
            <Box
              sx={{
                '.MuiListItemIcon-root': {
                  minWidth: 'unset !important',
                },
              }}
            >
              <ListItem
                dense
                disablePadding
                sx={{ mb: -1 }}
                onClick={() => {
                  setTableState((prev) => ({
                    ...prev,
                    columnSize: {
                      ...prev.columnSize,
                      [prev.tab]: {
                        ...prev.columnSize?.[tableState.tab],
                        [props.colDef.field]: { flex: 1 },
                      },
                    },
                  }));

                  props.hideMenu({
                    stopPropagation: () => {},
                  });
                }}
              >
                <ListItemButton>
                  <ListItemIcon>
                    <ArrowSplitVertical fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={translations.columnFillAvailableSpace}
                    primaryTypographyProps={{
                      variant: 'body1',
                    }}
                  />
                </ListItemButton>
              </ListItem>

              <GridColumnMenu {...props} />
            </Box>
          ),
          ...rest.slots,
        }}
        slotProps={{
          footer: {
            resetTableState: () => {
              store.removeItem(`prefs_${id}`);

              setTableState((prev) => ({
                ...prev,
                // tab: defaultTabId,
                search: '',
                filters: {},
                page: 0,
                pageSize: pageSizeOptions[0],
                sortModel: sortBy ? [sortBy] : [],
                persistPageSize: {},
                persistSortModel: {},
                visibility: {},
                columnSize: {},
                pinnedColumns: {},
                columnsOrder: {},
              }));
              setReset(true);
            },
          } as any,
          ...rest.slotProps,
        }}
        columnHeaderHeight={48}
      />
    </Box>
  );
}
