export type BreadcrumbsItem = {
  text: string;
  icon?: React.FunctionComponent;
  href?: string;
  onClick?: () => void;
  copyOnClick?: boolean;
  element?: React.ReactNode;
};

export type BreadcrumbsSelector =
  | BreadcrumbsItem
  | ((row: any) => BreadcrumbsItem);

export type FormBreadcrumbsProps = {
  breadcrumbs: BreadcrumbsSelector[];
  defaultRoute?: string;
  deps?: string[];
};
