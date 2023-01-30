import { PromiseOrValue } from "types";

type Selector = string | null;

export type FormFetcherHasuraRemoteFieldResolver = {
  source: string;
  selection: string | string[];
  filter?: Record<string, any>;
  resolveItems: (items: any[]) => PromiseOrValue<any>;
};

export type FormFetcherHasuraLocalFieldResolver = {
  selection: string | string[];
  resolveValue?: (response: any) => PromiseOrValue<any>;
};

export type FormFetcherHasuraFieldResolver =
  | FormFetcherHasuraLocalFieldResolver
  | FormFetcherHasuraRemoteFieldResolver
  | null;

export type FormFetcherField =
  | string
  | {
      name: string;
      resolver: FormFetcherHasuraFieldResolver;
    };

export type FormFetcherContextType = {
  fetchedEntity?: any;
  register: (field: FormFetcherField) => void;
  unregister: (name: string) => void;
  refetch: (resolvers?: string[]) => Promise<any>;
} | null;

export type FormFetcherProps = {
  method?: "hasura";
  source: string;
  entityId?: string | number | Record<string, any> | null;
  selector?: Record<string, Selector>;
  onSelection?: (selections: string[]) => string[];
  fetchEntity?: (fields: string[]) => PromiseOrValue<any>;
  onFetch?: (item: any) => PromiseOrValue<any>;
};
