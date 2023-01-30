import { IconButton } from "@mui/material";
import { GridRenderCellParams, GridStateColDef } from "@mui/x-data-grid";
import { Pencil } from "mdi-material-ui";

type ColDefType = GridStateColDef<any, any, any> & {
  onEdit?: (row: any) => void;
  link?: (row: any) => string;
};

export type EditRowColumnProps = GridRenderCellParams<any, any, any>;

export default function EditRowColumn({ row, colDef }: EditRowColumnProps) {
  const { onEdit, link } = colDef as ColDefType;

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
        <Pencil fontSize="small" />
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
      <Pencil fontSize="small" />
    </IconButton>
  );
}
