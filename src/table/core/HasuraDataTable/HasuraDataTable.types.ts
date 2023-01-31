import type { HasuraSelectProps } from 'types';

import type {
  BaseDataTableProps,
  BaseDataTableColumnDef,
} from '../BaseDataTable';
import type { ShowAlertProps } from '../ConfirmDialog';
import type { RowsCustomFilterDef } from '../RowsCustomFilterForm';
import type { RowsSearchFilterProps } from '../RowsSearchFilter';
import type { DataTableTabFilter } from '../RowsTabsFilter';

type HasuraDataTableColumnSortFunc = (sort: string) => Record<string, any>[];

export type HasuraDeleteProps = {
  confirm?: ShowAlertProps | false;
  filter?: (row: any) => Record<string, any>;
  setValues?: Record<string, any>;
  deleteAction?: (row: any) => Promise<boolean>;
};

export type HasuraDataTableColumnDef<
  T1 = string | undefined | false,
  T2 = boolean | undefined,
> = BaseDataTableColumnDef & {
  selector?: T1;
  sortable?: T2;
  onSort?: T2 extends true | undefined
    ? T1 extends string
      ? HasuraDataTableColumnSortFunc
      : HasuraDataTableColumnSortFunc | undefined
    : undefined;
  fetchRemoved?: boolean;
};

export type HasuraDataTableTabFilter = DataTableTabFilter & {
  filter?: Record<string, any>;
};

export type HasuraDataTableSearchFilter = RowsSearchFilterProps & {
  filter: (search: string[]) => Record<string, any>;
};

export type HasuraDataTableCustomFilter = RowsCustomFilterDef & {
  filter?: (value: any) => Record<string, any>;
};

export type HasuraDataTableProps = Omit<
  BaseDataTableProps<
    HasuraDataTableColumnDef,
    HasuraDataTableTabFilter,
    HasuraDataTableSearchFilter,
    HasuraDataTableCustomFilter
  >,
  'rows' | 'onDelete' | 'ref' | 'skeletonLoading'
> & {
  source: string;
  deleteProps?: HasuraDeleteProps;
  selectProps?: Partial<HasuraSelectProps>;
  skeletonRowsCount?: number;
  disableInitialization?: boolean;
  fetchAll?: boolean;
  disableRemovedFilter?: boolean;
};
