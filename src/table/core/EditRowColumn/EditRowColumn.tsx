import { IconButton } from '@mui/material';
import { GridRenderCellParams, GridStateColDef } from '@mui/x-data-grid';
import { Pencil } from 'mdi-material-ui';
import { ReactNode } from 'react';

type ColDefType = GridStateColDef<any, any, any> & {
  onEdit?: (row: any) => void;
  link?: (row: any) => string;
  Icon?: ReactNode;
};

export type EditRowColumnProps = GridRenderCellParams<any, any, any>;

export default function EditRowColumn({ row, colDef }: EditRowColumnProps) {
  const { onEdit, link, Icon } = colDef as ColDefType;

  const IconComponent = Icon ?? <Pencil fontSize="small" />;

  if (link) {
    return (
      <IconButton
        size="small"
        href={link(row)}
        onClick={() => {
          if (onEdit) {
            onEdit(row);
          }
        }}
      >
        {IconComponent}
      </IconButton>
    );
  }

  return (
    <IconButton
      disabled={!onEdit}
      size="small"
      onClick={() => {
        if (onEdit) {
          onEdit(row);
        }
      }}
    >
      {IconComponent}
    </IconButton>
  );
}
