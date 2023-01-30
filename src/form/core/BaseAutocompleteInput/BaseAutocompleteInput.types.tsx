import { AutocompleteProps, TextFieldProps } from "@mui/material";
import type { Omit } from "type-zoo/types";

import { PromiseOrValue } from "types";

import { BaseInputProps } from "../BaseInput";
import { InternalNumberInputProps } from "../NumberInput";

export type AutocompleteOption = {
  text: string;
  value: string | number;
  item?: any;
};

export type RemoteAutocompleteProps = {
  itemValue?: string | ((item: any) => string);
  itemText: string | ((item: any) => string);
  fetchAll?: boolean;
};

type AutocompleteTextFieldProps = {
  label?: TextFieldProps["label"];
  helperText?: TextFieldProps["helperText"];
  inputProps?: Omit<
    TextFieldProps,
    "name" | "required" | "type" | "label" | "inputProps"
  > &
    (
      | { type?: TextFieldProps["type"]; inputProps?: any }
      | { type: "number"; inputProps?: InternalNumberInputProps }
    );
};

export type BaseAutocompleteInputProps<
  TFields extends Record<string, any>,
  TOption extends AutocompleteOption,
  M extends boolean | undefined = undefined,
  D extends boolean | undefined = undefined,
  F extends boolean | undefined = undefined
> = BaseInputProps<TFields> &
  Omit<
    AutocompleteProps<TOption, M, D, F>,
    "name" | "renderInput" | "value" | "onChange"
  > &
  AutocompleteTextFieldProps & {
    value?: AutocompleteProps<string, M, D, F>["value"];
    onChange?: AutocompleteProps<string, M, D, F>["onChange"];
    keepObject?: boolean;
    addNewOption?: {
      text?: string;
      onClick: () => PromiseOrValue<void>;
    };
  };
