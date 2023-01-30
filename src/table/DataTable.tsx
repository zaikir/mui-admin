import { forwardRef, Ref } from "react";

import { DataTableProps, DataTableRef } from "./DataTable.types";
import { HasuraDataTable } from "./core/HasuraDataTable";

const DataTable = forwardRef(
  ({ mode, ...rest }: DataTableProps, ref: Ref<DataTableRef>) => {
    if (mode === "hasura") {
      return <HasuraDataTable ref={ref} {...rest} />;
    }

    throw new Error(`Unknown mode: ${mode}`);
  }
);

export default DataTable;
