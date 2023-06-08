import AddIcon from '@mui/icons-material/Add';
import {
  Autocomplete,
  AutocompleteFreeSoloValueMapping,
  AutocompleteValue,
  Box,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import { useContext } from 'react';

import { ConfigurationContext } from 'contexts/ConfigurationContext';

import {
  BaseAutocompleteInputProps,
  AutocompleteOption,
} from './BaseAutocompleteInput.types';
import { FormConfigContext } from '../../contexts/FormConfigContext/FormConfigContext';
import { BaseInput } from '../BaseInput';
import { BaseTextField } from '../BaseTextField';
import { InternalNumberInput } from '../NumberInput';

const ADD_NEW_OPTION_KEY = '__add_new__';

export default function BaseAutocompleteInput<
  TFields extends Record<string, any>,
  TOption extends AutocompleteOption,
  M extends boolean | undefined = undefined,
  D extends boolean | undefined = undefined,
  F extends boolean | undefined = undefined,
>({
  name,
  value: controlledValue,
  required,
  xs,
  sm,
  md,
  lg,
  xl,
  grid,
  label,
  helperText,
  inputProps,
  keepObject,
  readOnly: readOnlyProp,
  formFetcherValueResolver,
  formSubmitterValueResolver,
  addNewOption,
  ...rest
}: BaseAutocompleteInputProps<TFields, TOption, M, D, F>) {
  const { translations, onSearch } = useContext(ConfigurationContext);
  const { dense, readOnly: globalReadOnly } = useContext(FormConfigContext);
  const readOnly = globalReadOnly || readOnlyProp;

  return (
    <BaseInput<TFields>
      name={name}
      value={controlledValue}
      required={required}
      xs={xs}
      sm={sm}
      md={md}
      lg={lg}
      xl={xl}
      grid={grid}
      formFetcherValueResolver={formFetcherValueResolver}
      formSubmitterValueResolver={formSubmitterValueResolver}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => {
        const currentValue = (() => {
          if (controlledValue != null) {
            return controlledValue;
          }

          if (value == null) {
            return rest.multiple ? ([] as TOption[]) : null;
          }

          return value;
        })();

        const isOptionEqualToValue = rest.isOptionEqualToValue
          ? rest.isOptionEqualToValue
          : (option: TOption, val: string | number) => {
              if (val == null) {
                return false;
              }

              return (
                // @ts-ignore
                option.value === (typeof val === 'object' ? val.value : val)
              );
            };

        const getOptionLabel = rest.getOptionLabel
          ? rest.getOptionLabel
          : (option: TOption | AutocompleteFreeSoloValueMapping<F>) => {
              if (option == null) {
                throw new Error('Option cannot be null');
              }

              if (typeof option === 'object') {
                return option.text || '';
              }

              if (rest.freeSolo) {
                const result = (rest.options.find((x) => x.value === option)
                  ?.text || option) as any;
                return typeof result === 'number' ? result?.toString() : result;
              }

              return rest.options.find((x) => x.value === option)?.text ?? '';
            };

        return (
          <Autocomplete
            {...rest}
            // @ts-ignore
            options={[
              ...rest.options,
              ...(addNewOption
                ? [
                    {
                      text: translations.addNewAutocompleteValue,
                      value: ADD_NEW_OPTION_KEY,
                      item: {
                        onClick: addNewOption.onClick,
                      },
                    },
                  ]
                : []),
            ]}
            value={currentValue as AutocompleteValue<TOption, M, D, F>}
            size={dense ? 'small' : rest.size}
            disableClearable={
              ((rest.disableClearable ||
                rest.disabled ||
                readOnly ||
                rest.loading) ??
                (rest.multiple || false)) as D
            }
            openOnFocus={rest.openOnFocus ?? true}
            fullWidth={rest.fullWidth ?? true}
            disableCloseOnSelect={rest.disableCloseOnSelect ?? !!rest.multiple}
            isOptionEqualToValue={isOptionEqualToValue as any}
            getOptionLabel={getOptionLabel}
            readOnly={readOnly}
            // autoHighlight
            // autoSelect={rest.autoSelect ?? (rest.freeSolo && !rest.multiple)}
            filterOptions={
              rest.filterOptions ??
              ((items, { inputValue }) => {
                if (!inputValue?.length) {
                  return items;
                }

                const strings = onSearch(inputValue.toString().toLowerCase());
                return items.filter((item) =>
                  strings.some((str) =>
                    item.text?.toLowerCase().includes(str.toLowerCase()),
                  ),
                );
              })
            }
            onInputChange={(event, inputValue, reason) => {
              if (!rest.multiple && rest.freeSolo) {
                const processedValue = (() => {
                  if (inputProps?.type === 'number') {
                    return inputValue === ''
                      ? null
                      : parseFloat(inputValue as string);
                  }

                  return inputValue === '' ? null : inputValue;
                })();

                onChange(processedValue);
                if (typeof rest.onChange === 'function') {
                  // @ts-ignore
                  rest.onChange(event, processedValue, reason, null);
                }
              }

              if (typeof rest.onInputChange === 'function') {
                rest.onInputChange(event, inputValue, reason);
              }
            }}
            // eslint-disable-next-line @typescript-eslint/no-shadow
            onChange={(event, value, reason, details) => {
              if (!rest.multiple && rest.freeSolo) {
                return;
              }

              const newValue = (() => {
                if (value == null) {
                  return rest.multiple ? ([] as TOption[]) : null;
                }

                if (keepObject) {
                  return value;
                }

                if (rest.multiple) {
                  return (value as TOption[]).map((x) =>
                    typeof x === 'object' ? x.value : x,
                  );
                }

                return typeof value === 'object'
                  ? (value as TOption).value
                  : value;
              })() as AutocompleteValue<string, M, D, F>;

              const processedValue = (() => {
                if (
                  newValue &&
                  rest.freeSolo &&
                  inputProps?.type === 'number'
                ) {
                  return rest.multiple
                    ? (newValue as string[]).map((x) => parseFloat(x))
                    : parseFloat(newValue as string);
                }

                return newValue;
              })() as AutocompleteValue<string, M, D, F>;

              onChange(processedValue);
              if (typeof rest.onChange === 'function') {
                rest.onChange(event, processedValue, reason, details as any);
              }
            }}
            onBlur={(event) => {
              onBlur();
              if (typeof rest.onBlur === 'function') {
                rest.onBlur(event);
              }
            }}
            renderOption={
              rest.renderOption ??
              ((props, option, { selected }) => {
                const isAddNewOption =
                  option &&
                  typeof option === 'object' &&
                  option.value === ADD_NEW_OPTION_KEY;

                return (
                  <Box
                    component="li"
                    {...props}
                    key={option.value}
                    onClick={(event) => {
                      if (isAddNewOption) {
                        option.item.onClick();
                        return;
                      }

                      props.onClick!(event);
                    }}
                  >
                    {isAddNewOption ? (
                      <>
                        <AddIcon sx={{ ml: -0.5, mr: 0.5 }} /> Добавить
                      </>
                    ) : (
                      <>
                        {rest.multiple && (
                          <Checkbox
                            sx={{ marginRight: 1 }}
                            checked={selected}
                          />
                        )}
                        {getOptionLabel(option)}
                      </>
                    )}
                  </Box>
                );
              })
            }
            renderInput={(params) => (
              <BaseTextField
                {...inputProps}
                {...params}
                value={value}
                name={name}
                required={required}
                label={label}
                readOnly={readOnly}
                variant={inputProps?.variant ?? 'outlined'}
                error={inputProps?.error || !!error}
                disableStartAdorementOffset={rest.multiple}
                placeholder={
                  rest.placeholder ??
                  (rest.freeSolo && !readOnly && !rest.disabled
                    ? translations?.autocompletePlaceholder
                    : undefined)
                }
                // @ts-ignore
                InputProps={{
                  ...params.InputProps,
                  ...inputProps?.InputProps,
                  endAdornment: (
                    <>
                      {rest.loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                      {inputProps?.InputProps?.endAdornment}
                    </>
                  ),
                  ...(inputProps?.type === 'number' && {
                    inputComponent: InternalNumberInput,
                  }),
                  readOnly,
                }}
                // eslint-disable-next-line react/jsx-no-duplicate-props
                inputProps={{
                  ...params.inputProps,
                  ...(inputProps?.type === 'number' && {
                    unmask: true,
                  }),
                  ...inputProps?.inputProps,
                }}
                helperText={error?.message || helperText || ' '}
              />
            )}
          />
        );
      }}
    />
  );
}
