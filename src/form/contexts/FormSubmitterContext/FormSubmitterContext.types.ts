import type { FormElementRef } from "packages/mui-admin";

import type { PromiseOrValue } from "types";

export type FormSubmitterField = {
  name: string;
  resolver: FormSubmitterValueResolver;
};

export type FormSubmitterContextType = {
  onSubmit: (
    item: any,
    context: { ref: FormElementRef }
  ) => PromiseOrValue<void>;
  register: (field: FormSubmitterField) => void;
  unregister: (name: string) => void;
} | null;

export type FormSubmitterDefaultValueResolver = {
  type?: "default";
  resolveValue: (item: Record<string, any>) => Record<string, any>;
};

export type FormSubmitterHasuraManyToManyValueResolver = {
  type: "hasura-many-to-many";
  source: string;
  foreignKey: string;
  entityId: Record<string, any>;
};

export type FormSubmitterValueResolver =
  | FormSubmitterDefaultValueResolver
  | FormSubmitterHasuraManyToManyValueResolver
  | null;

export type FormHasuraSubmitterProps = {
  mode?: "hasura";
  source: string;
  selection?: PromiseOrValue<string[]>;
  ignoreFields?: string[];
};

export type FormRestSubmitterProps = {
  mode: "rest";
  url:
    | string
    | ((entity: any) => PromiseOrValue<{ url: string; method: string }>);
};

export type FormSubmitterProps = {
  entityId?: string | number | Record<string, any> | null;
  clearEntity?: (item: any) => PromiseOrValue<any>;
  preSubmit?: (item: any) => PromiseOrValue<any | null>;
  onSubmit?: (item: any) => PromiseOrValue<void>;
  resetAfterSubmit?: boolean;
  showSuccessAlert?: boolean;
} & (FormHasuraSubmitterProps | FormRestSubmitterProps);
