import { Ref } from 'react';
import type { Omit } from 'type-zoo';

import { HasuraSelectProps } from 'types';

import {
  AutocompleteOption,
  RemoteAutocompleteProps,
  BaseAutocompleteInputProps,
} from '../BaseAutocompleteInput/BaseAutocompleteInput.types';

type HasuraAutocompleteInputPreset =
  | {
      preset: 'suggestion';
      itemText?: RemoteAutocompleteProps['itemText'];
      selection?: string | string[];
    }
  | {
      preset?: 'none';
      itemText: RemoteAutocompleteProps['itemText'];
      selection: string | string[];
    };

export type HasuraAutocompleteRef = {
  refetch: () => void;
};

export type HasuraAutocompleteInputProps<
  TFields extends Record<string, any> = Record<string, any>,
  TOption extends AutocompleteOption = AutocompleteOption,
  M extends boolean | undefined = undefined,
  D extends boolean | undefined = undefined,
  F extends boolean | undefined = undefined,
> = Omit<
  BaseAutocompleteInputProps<TFields, TOption, M, D, F>,
  'options' | 'loading' | 'type'
> &
  Omit<Partial<HasuraSelectProps>, 'filter'> &
  Omit<RemoteAutocompleteProps, 'itemText'> &
  HasuraAutocompleteInputPreset & {
    source: string;
    orderBy?: Record<string, any> | [Record<string, any>];
    distinctOn?: string[];
    limit?: number;
    filter?:
      | ((search: string) => HasuraSelectProps['filter'])
      | HasuraSelectProps['filter']
      | null;
    controlRef?: Ref<HasuraAutocompleteRef>;
    disableFetch?: boolean;
    skipFetchContextCheck?: boolean;
  };
