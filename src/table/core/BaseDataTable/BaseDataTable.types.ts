import { DataGrid, GridColumnTypesRecord } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

import { ConfigurationType } from "contexts/ConfigurationContext";
import { NotificationsContextType } from "contexts/NotificationsContext";
import { PromiseOrValue } from "types";

import { ShowAlertProps } from "../ConfirmDialog";
import { RowsCustomFilterDef } from "../RowsCustomFilterForm";
import type {
  RowsFilterProps,
  RowsFilterState,
} from "../RowsFilter/RowsFilter.types";
import { RowsSearchFilterProps } from "../RowsSearchFilter";
import { DataTableTabFilter } from "../RowsTabsFilter";

type MuiDataGridProps = React.ComponentProps<typeof DataGrid>;
type NativeColumnType =
  | "string"
  | "number"
  | "date"
  | "dateTime"
  | "boolean"
  | "singleSelect"
  | "actions";
type ExcludedMuiDataGridProps =
  | "columns"
  | "editMode"
  | "editRowsModel"
  | "onRowEditCommit"
  | "onRowEditStart"
  | "onRowEditStop"
  | "onEditRowsModelChange"
  | "onStateChange";
type EditableProps =
  | {
      columnProps?: Partial<GridColumnTypesRecord>;
      onEdit?: (row: any) => void;
      link?: (row: any) => string;
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

export type BaseDataTableBaseColumnDef = Omit<GridColDef, "type"> & {
  type?: NativeColumnType | "phone" | "email";
  placeholder?: string | false;
  tabs?: string[];
};

export type BaseDataTableEditColumnDef = Omit<GridColDef, "type"> & {
  type: "edit";
} & EditableProps &
  Omit<BaseDataTableBaseColumnDef, "type">;

export type BaseDataTableDeleteColumnDef = Omit<GridColDef, "type"> & {
  type: "delete";
  confirm?: ShowAlertProps;
  onDelete?: (row: any) => PromiseOrValue<void>;
} & Omit<BaseDataTableBaseColumnDef, "type">;

export type BaseDataTableRelationshipColumnDef = Omit<GridColDef, "type"> & {
  type: "relationship";
  isRemovedGetter?: (row: Record<string, any>) => boolean;
} & Omit<BaseDataTableBaseColumnDef, "type">;

type BaseDataTableColumnContext = {
  configuration: ConfigurationType;
  notifications: NotificationsContextType;
};

export type BaseDataTableIconButtonColumnDef = Omit<GridColDef, "type"> & {
  type: "icon-button";
  // eslint-disable-next-line max-len
  icon:
    | React.ReactNode
    | ((row: any, context: BaseDataTableColumnContext) => React.ReactNode);
  tooltip?:
    | React.ReactNode
    | ((row: any, context: BaseDataTableColumnContext) => React.ReactNode);
  onClick?: (
    row: any,
    context: BaseDataTableColumnContext
  ) => PromiseOrValue<void>;
} & Omit<BaseDataTableBaseColumnDef, "type">;

export type BaseDataTableSortColumnDef = Omit<GridColDef, "type" | "onSort"> & {
  type: "sort";
  rowsSortValues: number[] | null;
  sortKey?: string;
  onSortChange?: (
    direction: "up" | "down",
    row: any,
    targetRowSort: number,
    context: BaseDataTableColumnContext
  ) => PromiseOrValue<void>;
} & Omit<BaseDataTableBaseColumnDef, "type">;

export type BaseDataTableSelectColumnDef = Omit<GridColDef, "type"> & {
  type: "select";
  items: { text: string; value: any }[];
} & Omit<BaseDataTableBaseColumnDef, "type">;

export type BaseDataTableColumnDef =
  | BaseDataTableBaseColumnDef
  | BaseDataTableEditColumnDef
  | BaseDataTableDeleteColumnDef
  | BaseDataTableIconButtonColumnDef
  | BaseDataTableSortColumnDef
  | BaseDataTableSelectColumnDef
  | BaseDataTableRelationshipColumnDef;

export type BaseDataInnerState = {
  page: number;
  pageSize: number;
  sortModel: MuiDataGridProps["sortModel"];
};

export type BaseDataTableState = RowsFilterState & BaseDataInnerState;

export type BaseTablePersistence =
  | { persistStateMode?: "none" }
  | { persistStateMode: "query"; queryPrefix?: string };

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
  CustomFilter extends RowsCustomFilterDef = RowsCustomFilterDef
> = Omit<MuiDataGridProps, ExcludedMuiDataGridProps> &
  Omit<
    RowsFilterProps<TabFilter, SearchFilter, CustomFilter>,
    "initialState" | "onChange"
  > &
  BaseTablePersistence &
  BaseTableEvents & {
    columns: TColumn[];
    editable?: EditableProps;
    deletable?: DeletableProps;
    sortBy?: { field: string; sort: "asc" | "desc" };
    filterRowsFunc?: (row: any, state: BaseDataTableState) => boolean;
    title?: BaseDataTableTitle;
    persistScrollBar?: boolean;
    skeletonLoading?: boolean | { rowsCount: number };
  };
