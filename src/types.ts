export type PromiseOrValue<T> = Promise<T> | T;

export type HasuraOrderBy =
  | 'ASC'
  | 'ASC_NULLS_LAST'
  | 'ASC_NULLS_FIRST'
  | 'DESC'
  | 'DESC_NULLS_LAST'
  | 'DESC_NULLS_FIRST';

export type HasuraSelectProps = {
  filter: Record<string, any> | null;
  source?: string;
  onSelection?: (selections: string[]) => string[];
  onSort?: (orderBy: Record<string, any>) => any;
  onFetch?: (items: any[]) => PromiseOrValue<any[]>;
};
