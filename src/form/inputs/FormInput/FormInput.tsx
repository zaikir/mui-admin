import { TextFieldProps } from '@mui/material';
import { useContext, useMemo } from 'react';
import { ControllerProps } from 'react-hook-form';
import { FieldValues } from 'react-hook-form/dist/types/fields';

import { ConfigurationContext } from '../../../contexts/ConfigurationContext';
import { FormConfigContext } from '../../contexts/FormConfigContext/FormConfigContext';
import { BaseInput, BaseInputProps } from '../../core/BaseInput';
import { BaseTextField } from '../../core/BaseTextField';
import { InputClearButton } from '../../core/InputClearButton';
import { MaskedInput, MaskedInputProps } from '../../core/MaskedInput';
import {
  InternalNumberInput,
  InternalNumberInputProps,
} from '../../core/NumberInput';
import { InternalPhoneInputProps, PhoneInput } from '../../core/PhoneInput';

export type FormInputProps<TFields extends FieldValues> =
  BaseInputProps<TFields> &
    Omit<TextFieldProps, 'name' | 'type'> &
    (
      | ({ type: 'number' } & InternalNumberInputProps)
      | ({ type: 'tel' | 'phone' } & InternalPhoneInputProps)
      | ({ type: 'mask' } & MaskedInputProps)
      | { type?: React.HTMLInputTypeAttribute }
    );

export default function FormInput<TFields extends FieldValues>({
  name,
  value: controlledValue,
  required,
  type,
  xs,
  sm,
  md,
  lg,
  xl,
  grid,
  clearable: clearableProp,
  readOnly: readOnlyProp,
  ...rest
}: FormInputProps<TFields>): JSX.Element {
  const { translations } = useContext(ConfigurationContext);
  const { dense, readOnly: globalReadOnly } = useContext(FormConfigContext);
  const readOnly = globalReadOnly || readOnlyProp;

  // eslint-disable-next-line max-len
  const clearable = !!(
    (clearableProp ?? (!rest.multiline && true)) &&
    !rest.disabled &&
    !readOnly
  );

  const Rules = useMemo<Record<string, ControllerProps['rules']>>(
    () => ({
      email: {
        pattern: {
          // eslint-disable-next-line no-useless-escape
          value:
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          message: translations!.wrongEmailFormat!,
        },
      },
    }),
    [translations],
  );

  if (type === 'tel' || type === 'phone') {
    return (
      <PhoneInput
        name={name}
        required={required}
        xs={xs}
        sm={sm}
        md={md}
        lg={lg}
        xl={xl}
        clearable={clearable}
        readOnly={readOnly}
        {...rest}
        size={dense ? 'small' : rest.size}
        sx={{
          ':hover .input-clear-button': { display: 'flex' },
          ...rest.sx,
        }}
      />
    );
  }

  let textFieldProps = rest;
  let inputProps: any = {};
  let InputComponent: any = null;

  if (type === 'number') {
    const {
      scale,
      min,
      max,
      eager,
      lazy,
      padFractionalZeros,
      thousandsSeparator,
      ...other
    } = rest as InternalNumberInputProps;
    inputProps = {
      scale,
      min,
      max,
      eager,
      lazy,
      padFractionalZeros,
      thousandsSeparator,
    };
    textFieldProps = other;
    InputComponent = InternalNumberInput;
  }

  if (type === 'mask') {
    const { overwrite, eager, mask, unmask, ...other } =
      rest as MaskedInputProps;
    inputProps = {
      overwrite,
      eager,
      mask,
      unmask,
    };
    textFieldProps = other;
    InputComponent = MaskedInput;
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
      rules={type && Rules[type]}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => (
        <BaseTextField
          {...textFieldProps}
          name={name}
          type={type === 'number' ? 'text' : type}
          value={value ?? ''}
          variant={rest.variant ?? 'outlined'}
          onChange={(event) => {
            const resultValue =
              event.target.value === '' ? null : event.target.value;

            onChange({ target: { value: resultValue } });
            if (typeof rest.onChange === 'function') {
              rest.onChange(event);
            }
          }}
          size={dense ? 'small' : rest.size}
          onBlur={onBlur}
          required={required}
          error={!!error}
          helperText={error?.message || rest.helperText || ' '}
          fullWidth={rest.fullWidth ?? true}
          readOnly={readOnly}
          InputProps={{
            ...textFieldProps.InputProps,
            endAdornment: (
              <>
                {clearable && value && !rest.disabled && !readOnly ? (
                  <InputClearButton
                    onClick={() => onChange({ target: { value: null } })}
                  />
                ) : null}
                {textFieldProps.InputProps?.endAdornment}
              </>
            ),
            inputComponent:
              InputComponent || textFieldProps.InputProps?.inputComponent,
          }}
          // eslint-disable-next-line react/jsx-no-duplicate-props
          inputProps={{
            ...rest.inputProps,
            ...inputProps,
          }}
          sx={{
            ':hover .input-clear-button': { display: 'flex' },
            ...rest.sx,
          }}
        />
      )}
    />
  );
}
