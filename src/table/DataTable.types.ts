import { BaseDataTableRef } from './core/BaseDataTable/BaseDataTable.types';
import type { HasuraDataTableProps } from './core/HasuraDataTable';

export type DataTableProps = { mode: 'hasura' } & HasuraDataTableProps;

export type DataTableRef = BaseDataTableRef;
