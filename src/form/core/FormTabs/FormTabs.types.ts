import { SxProps, Tab, Tabs } from "@mui/material";
import type { Omit } from "type-zoo/types";

type TabsProps = React.ComponentProps<typeof Tabs>;
type TabProps = React.ComponentProps<typeof Tab>;

export type FormTabDef = {
  id?: string;
  label: string;
  icon?: TabProps["icon"];
};

export type FormTabsPersistence =
  | { persistStateMode?: "none" }
  | { persistStateMode: "query"; queryPrefix?: string };

export type FormTabsProps = FormTabsPersistence & {
  tabs: FormTabDef[];
  children?: React.ReactNode;
  tabsWrapperStyle?: SxProps;
  tabsProps?: Omit<TabsProps, "value">;
  tabProps?: Omit<TabProps, "id" | "label">;
};
