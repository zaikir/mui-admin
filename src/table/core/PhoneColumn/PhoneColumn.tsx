import { Box } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";

import { formatPhone } from "../../utils/formatPhone";
import { isValueEmpty } from "../../utils/isValueEmpty";
import { BaseDataTableColumnDef } from "../BaseDataTable";

export type PhoneColumnProps = GridRenderCellParams<any, any, any>;

export default function PhoneColumn({ value, colDef }: PhoneColumnProps) {
  const column = colDef as BaseDataTableColumnDef;

  if (isValueEmpty(value)) {
    return <span>{column.placeholder ?? "—"}</span>;
  }

  return (
    <Box
      component="a"
      sx={{
        textDecoration: "none",
        "&:hover": { textDecoration: "underline" },
        color: "inherit",
      }}
      href={`tel://+${value}`}
      itemProp="telephone"
    >
      {formatPhone(value)}
    </Box>
  );
}
