import { IconButton } from '@mui/material';
import type { Omit } from 'type-zoo/types';

import DataTable from 'table/DataTable';
import type { BaseDataTableRef } from 'table/core/BaseDataTable';

import { FormDialog } from '../FormDialog';

type DataTableProps = React.ComponentProps<typeof DataTable>;
type FormDialogProps = React.ComponentProps<typeof FormDialog>;
type IconButtonProps = React.ComponentProps<typeof IconButton>;

export type DataTableExProps = Omit<DataTableProps, 'mode'> & {
  title?: string;
  titleProps?: {
    position?: 'search' | 'default';
  };
  addButton?: IconButtonProps | false;
  editPageUrl?: string | ((row: any) => string) | false;
  automaticallyOpenEditPage?: boolean;
  children?: React.ReactNode;
  formTitle?: (isNew: boolean) => string;
  formDialogProps?: Partial<
    FormDialogProps & {
      onOpen?: () => void;
      entityIdResolver?: (entity: any) => FormDialogProps['entityId'];
    }
  >;
  inline?: boolean;
  inlineHeight?: number;
  queryPrefix?: string;
  components?: {
    FormDialog?: React.JSXElementConstructor<any>;
  } & DataTableProps['components'];
};

export type DataTableExRef = BaseDataTableRef & {
  openFormDialog: (entity?: any) => void;
};
