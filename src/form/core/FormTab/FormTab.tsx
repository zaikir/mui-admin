import { Box } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { useContext, useMemo } from "react";

import { FormTabProps } from "./FormTab.types";
import { FormTabContext } from "../../contexts/FormTabContext";
import { FormTabsContext } from "../../contexts/FormTabsContext";

export default function FormTab({ tab, children, sx, grid }: FormTabProps) {
  const { tab: selectedTab } = useContext(FormTabsContext);

  const tabContextData = useMemo(
    () => ({
      tab,
    }),
    [tab]
  );

  const style = { ...sx, ...(selectedTab !== tab && { display: "none" }) };

  const content =
    typeof children === "function" ? children(selectedTab === tab) : children;

  return (
    <FormTabContext.Provider value={tabContextData}>
      {grid ?? true ? (
        <Grid container sx={style}>
          {content}
        </Grid>
      ) : (
        <Box sx={style}>{content}</Box>
      )}
    </FormTabContext.Provider>
  );
}
