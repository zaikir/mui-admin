import {
  DataGridPro,
  GridColDef,
  GridColumnTypesRecord,
  GridPinnedColumns,
} from '@mui/x-data-grid-pro';
import { ReactNode } from 'react';

import { ConfigurationType } from 'contexts/ConfigurationContext';
import { NotificationsContextType } from 'contexts/NotificationsContext';

import { PromiseOrValue } from '../../../';
import { ShowAlertProps } from '../ConfirmDialog';
import { RowsCustomFilterDef } from '../RowsCustomFilterForm';
import type {
  RowsFilterProps,
  RowsFilterState,
} from '../RowsFilter/RowsFilter.types';
import { RowsSearchFilterProps } from '../RowsSearchFilter';
import { DataTableTabFilter } from '../RowsTabsFilter';

type MuiDataGridProps = React.ComponentProps<typeof DataGridPro>;
type NativeColumnType =
  | 'string'
  | 'number'
  | 'date'
  | 'dateTime'
  | 'boolean'
  | 'singleSelect'
  | 'actions';
type ExcludedMuiDataGridProps =
  | 'columns'
  | 'editMode'
  | 'editRowsModel'
  | 'onRowEditCommit'
  | 'onRowEditStart'
  | 'onRowEditStop'
  | 'onEditRowsModelChange'
  | 'onStateChange';
type EditableProps =
  | {
      columnProps?: Partial<GridColumnTypesRecord>;
      onEdit?: (row: any) => void;
      link?: (row: any) => string;
      icon?: 'pencil' | 'eye';
    }
  | false;

type DeletableProps =
  | {
      columnProps?: Partial<GridColumnTypesRecord>;
      confirm?: ShowAlertProps;
      isEnabled?: (row: any) => boolean;
      deleteFunc?: (row: any) => PromiseOrValue<void>;
      onDeleted?: (row: any) => PromiseOrValue<void>;
    }
  | boolean;

export type BaseDataTableRef = {
  reload: () => Promise<void>;
};

export type BaseDataTableBaseColumnDef = Omit<GridColDef, 'type'> & {
  type?: NativeColumnType | 'phone' | 'email';
  placeholder?: string | false;
  tabs?: string[];
};

export type BaseDataTableEditColumnDef = Omit<GridColDef, 'type'> & {
  type: 'edit';
} & EditableProps &
  Omit<BaseDataTableBaseColumnDef, 'type'>;

export type BaseDataTableDeleteColumnDef = Omit<GridColDef, 'type'> & {
  type: 'delete';
  confirm?: ShowAlertProps;
  onDelete?: (row: any) => PromiseOrValue<void>;
} & Omit<BaseDataTableBaseColumnDef, 'type'>;

export type BaseDataTableRelationshipColumnDef = Omit<GridColDef, 'type'> & {
  type: 'relationship';
  isRemovedGetter?: (row: Record<string, any>) => boolean;
} & Omit<BaseDataTableBaseColumnDef, 'type'>;

type BaseDataTableColumnContext = {
  configuration: ConfigurationType;
  notifications: NotificationsContextType;
};

export type BaseDataTableIconButtonColumnDef = Omit<GridColDef, 'type'> & {
  type: 'icon-button';
  // eslint-disable-next-line max-len
  icon:
    | React.ReactNode
    | ((row: any, context: BaseDataTableColumnContext) => React.ReactNode);
  tooltip?:
    | React.ReactNode
    | ((row: any, context: BaseDataTableColumnContext) => React.ReactNode);
  onClick?: (
    row: any,
    context: BaseDataTableColumnContext,
  ) => PromiseOrValue<void>;
} & Omit<BaseDataTableBaseColumnDef, 'type'>;

export type BaseDataTableSortColumnDef = Omit<GridColDef, 'type' | 'onSort'> & {
  type: 'sort';
  rowsSortValues: number[] | null;
  sortKey?: string;
  onSortChange?: (
    direction: 'up' | 'down',
    row: any,
    targetRowSort: number,
    context: BaseDataTableColumnContext,
  ) => PromiseOrValue<void>;
} & Omit<BaseDataTableBaseColumnDef, 'type'>;

export type BaseDataTableSelectColumnDef = Omit<GridColDef, 'type'> & {
  type: 'select';
  items: { text: string; value: any }[];
} & Omit<BaseDataTableBaseColumnDef, 'type'>;

export type BaseDataTableNameColumnDef = Omit<GridColDef, 'type'> & {
  type: 'name';
  activeDateKey?: string | ((row: any) => string);
  dateThreshold?: number;
  dotColor?: (row: any) => 'red' | 'green';
} & Omit<BaseDataTableBaseColumnDef, 'type'>;

export type BaseDataTableColorColumnDef = Omit<GridColDef, 'type'> & {
  type: 'color';
} & Omit<BaseDataTableBaseColumnDef, 'type'>;

export type BaseDataTableTranslationColumnDef = Omit<GridColDef, 'type'> & {
  type: 'translation';
  languageId?: number | string;
} & Omit<BaseDataTableBaseColumnDef, 'type'>;

export type BaseDataTableFileColumnDef = Omit<GridColDef, 'type'> & {
  type: 'file';
  size?: number;
  hideText?: boolean;
} & Omit<BaseDataTableBaseColumnDef, 'type'>;

export type BaseDataTableColumnDef = (
  | BaseDataTableBaseColumnDef
  | BaseDataTableEditColumnDef
  | BaseDataTableDeleteColumnDef
  | BaseDataTableIconButtonColumnDef
  | BaseDataTableSortColumnDef
  | BaseDataTableSelectColumnDef
  | BaseDataTableNameColumnDef
  | BaseDataTableFileColumnDef
  | BaseDataTableColorColumnDef
  | BaseDataTableTranslationColumnDef
  | BaseDataTableRelationshipColumnDef
) & { hidden?: boolean };

export type BaseDataInnerState = {
  page: number;
  pageSize: number;
  sortModel: MuiDataGridProps['sortModel'];
  persistPageSize: Record<string, number>;
  persistSortModel: Record<string, MuiDataGridProps['sortModel']>;
  visibility: Record<string, Record<string, boolean>>;
  columnSize: Record<
    string,
    Record<string, { width: number } | { flex: number }>
  >;
  pinnedColumns: Record<string, GridPinnedColumns>;
  columnsOrder: Record<string, string[]>;
};

export type BaseDataTableState = RowsFilterState & BaseDataInnerState;

export type BaseTablePersistence =
  | { persistStateMode?: 'none' }
  | { persistStateMode: 'query'; queryPrefix?: string };

export type BaseTableEvents = {
  onInitialized?: (state: BaseDataTableState) => void;
  onStateChanged?: (state: BaseDataTableState) => void;
};

export type BaseDataTableTitle =
  | string
  | {
      title?: string | React.ReactNode;
      actionButton?: React.ReactNode;
    }
  | undefined;

export type BaseDataTableProps<
  TColumn extends BaseDataTableColumnDef = BaseDataTableColumnDef,
  TabFilter extends DataTableTabFilter = DataTableTabFilter,
  SearchFilter extends RowsSearchFilterProps = RowsSearchFilterProps,
  CustomFilter extends RowsCustomFilterDef = RowsCustomFilterDef,
> = Omit<MuiDataGridProps, ExcludedMuiDataGridProps> &
  Omit<
    RowsFilterProps<TabFilter, SearchFilter, CustomFilter>,
    'initialState' | 'onChange' | 'slots'
  > &
  BaseTablePersistence &
  BaseTableEvents & {
    id: string;
    columns: TColumn[];
    editable?: EditableProps;
    deletable?: DeletableProps;
    sortBy?: { field: string; sort: 'asc' | 'desc' };
    filterRowsFunc?: (row: any, state: BaseDataTableState) => boolean;
    title?: BaseDataTableTitle;
    persistScrollBar?: boolean;
    skeletonLoading?: boolean | { rowsCount: number };
    columnTypes?: Record<string, any>;
  };
