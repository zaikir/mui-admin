import {
  AutocompleteOption,
  BaseAutocompleteInputProps,
} from '../../core/BaseAutocompleteInput/BaseAutocompleteInput.types';
import { HasuraAutocompleteInputProps } from '../../core/HasuraAutocompleteInput';

export type AutocompleteMode = 'hasura';

export type AutocompleteInputProps<
  TFields extends Record<string, any> = Record<string, any>,
  TOption extends AutocompleteOption = AutocompleteOption,
  M extends boolean | undefined = boolean | undefined,
  D extends boolean | undefined = boolean | undefined,
  F extends boolean | undefined = boolean | undefined,
> =
  | ({ mode?: 'memory' } & BaseAutocompleteInputProps<
      TFields,
      TOption,
      M,
      D,
      F
    >)
  | ({ mode: 'hasura' } & HasuraAutocompleteInputProps<
      TFields,
      TOption,
      M,
      D,
      F
    >);
