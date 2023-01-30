import type { Omit } from "type-zoo";

import { AutocompleteOption } from "form/core/BaseAutocompleteInput/BaseAutocompleteInput.types";
import { HasuraAutocompleteInputProps } from "form/core/HasuraAutocompleteInput";
import type { AutocompleteInputProps } from "form/inputs/AutocompleteInput";
import type { CheckboxInputProps } from "form/inputs/CheckboxInput/CheckboxInput";
import type { ChipsInputProps } from "form/inputs/ChipsInput/ChipsInput";
import type { DateInputProps } from "form/inputs/DateInput";
import type { FormInputProps } from "form/inputs/FormInput";
import type { SelectInputProps } from "form/inputs/SelectInput/SelectInput";

// Omit< , 'type' | 'value' | 'onChange' | 'filter'>

export type RowsCustomFilterDef<
  TOption extends AutocompleteOption = AutocompleteOption
> = {
  name: string;
  field: string;
  width?: number;
  filter?: unknown;
} & (
  | ({ type: "text" | "phone" | "tel" | "number" } & Omit<
      FormInputProps<any>,
      "type"
    >)
  | ({ type: "date" } & Omit<DateInputProps<any>, "type">)
  | ({ type: "boolean" } & Omit<CheckboxInputProps<any>, "type">)
  | ({ type: "select" } & Omit<SelectInputProps<any>, "type">)
  | ({ type: "autocomplete" } & Omit<
      AutocompleteInputProps<any, TOption>,
      "type" | "value" | "onChange" | "filter"
    > & {
        filterItems?: HasuraAutocompleteInputProps<any, TOption>["filter"];
      })
  | ({ type: "chips"; inputType?: ChipsInputProps<any>["type"] } & Omit<
      ChipsInputProps<any>,
      "type"
    >)
);

export type RowsCustomFilterInput = RowsCustomFilterDef & { id: string };

export type RowsCustomFilterFormProps = {
  value: Record<string, any>;
  onChange: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  inputs: RowsCustomFilterInput[];
  onDeleteInput: (input: RowsCustomFilterInput) => void;
};
