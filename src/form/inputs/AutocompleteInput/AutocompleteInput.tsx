import { AutocompleteInputProps } from "./AutocompleteInput.types";
import { BaseAutocompleteInput } from "../../core/BaseAutocompleteInput";
import { AutocompleteOption } from "../../core/BaseAutocompleteInput/BaseAutocompleteInput.types";
import { HasuraAutocompleteInput } from "../../core/HasuraAutocompleteInput";

export default function AutocompleteInput<
  TOption extends AutocompleteOption,
  TFields extends Record<string, any>,
  M extends boolean | undefined = undefined,
  D extends boolean | undefined = undefined,
  F extends boolean | undefined = undefined
>(props: AutocompleteInputProps<TFields, TOption, M, D, F>) {
  if (!props.mode || props.mode === "memory") {
    const { mode, ...rest } = props;
    return <BaseAutocompleteInput {...rest} />;
  }

  if (props.mode === "hasura") {
    const { mode, ...rest } = props;
    return <HasuraAutocompleteInput {...rest} />;
  }

  throw new Error(`Mode not implemented: ${props.mode}`);
}
