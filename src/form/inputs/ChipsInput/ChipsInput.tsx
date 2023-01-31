import { MenuItemTypeMap, TextFieldProps } from '@mui/material';
import { MuiChipsInput } from 'mui-chips-input';
import { useContext } from 'react';
import { FieldValues } from 'react-hook-form/dist/types/fields';

import { ConfigurationContext } from '../../../contexts/ConfigurationContext';
import { FormConfigContext } from '../../contexts/FormConfigContext/FormConfigContext';
import { BaseInput, BaseInputProps } from '../../core/BaseInput';
import {
  InternalNumberInput,
  InternalNumberInputProps,
} from '../../core/NumberInput';

export type SelectMenuItemType = MenuItemTypeMap<object, 'li'>['props'] & {
  value: string | number;
} & ({ text: string } | { children: React.ReactNode });

export type ChipsInputProps<TFields extends FieldValues> =
  BaseInputProps<TFields> &
    Omit<TextFieldProps, 'name' | 'type'> &
    (({ type: 'number' } & InternalNumberInputProps) | { type?: undefined });

export default function ChipsInput<TFields extends FieldValues>({
  name,
  value: controlledValue,
  required,
  xs,
  sm,
  md,
  lg,
  xl,
  grid,
  type,
  readOnly: readOnlyProp,
  ...rest
}: ChipsInputProps<TFields>): JSX.Element {
  const { translations } = useContext(ConfigurationContext);
  const { dense, readOnly: globalReadOnly } = useContext(FormConfigContext);
  const readOnly = globalReadOnly || readOnlyProp;

  let textFieldProps = rest;
  let inputProps: any = {};
  let InputComponent: any = null;

  if (type === 'number') {
    const { scale, min, max, eager, lazy, ...other } =
      rest as InternalNumberInputProps;
    inputProps = {
      scale,
      min,
      max,
      eager,
      lazy,
      unmask: true,
    } as InternalNumberInputProps;
    textFieldProps = other;
    InputComponent = InternalNumberInput;
  }

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
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => {
        const processedValues =
          value && type === 'number'
            ? value.map((x: number) => x.toString())
            : value;

        return (
          // @ts-ignore
          <MuiChipsInput
            {...textFieldProps}
            name={name}
            value={processedValues ?? []}
            fullWidth={rest.fullWidth ?? true}
            onChange={(values) => {
              const newValues =
                type === 'number' ? values.map(parseFloat) : values;

              onChange(newValues);
              if (typeof rest.onChange === 'function') {
                rest.onChange(newValues as any);
              }
            }}
            disabled={readOnly}
            size={dense ? 'small' : rest.size}
            onBlur={onBlur}
            error={!!error}
            variant={rest.variant ?? 'outlined'}
            helperText={error?.message || rest.helperText || ' '}
            InputProps={{
              ...textFieldProps.InputProps,
              inputComponent:
                InputComponent || textFieldProps.InputProps?.inputComponent,
            }}
            // eslint-disable-next-line react/jsx-no-duplicate-props
            inputProps={{
              ...rest.inputProps,
              ...inputProps,
            }}
            placeholder={
              rest.placeholder ?? translations?.autocompletePlaceholder
            }
          />
        );
      }}
    />
  );
}
