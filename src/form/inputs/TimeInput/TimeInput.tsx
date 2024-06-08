import { AccessTime } from '@mui/icons-material';
import { InputAdornment, TextFieldProps } from '@mui/material';
import {
  DatePickerProps,
  TimePicker,
  TimePickerProps,
} from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { useContext } from 'react';
import { FieldValues } from 'react-hook-form/dist/types/fields';

import { ConfigurationContext } from '../../../contexts/ConfigurationContext';
import { FormConfigContext } from '../../contexts/FormConfigContext/FormConfigContext';
import { BaseInput, BaseInputProps } from '../../core/BaseInput';
import { BaseTextField } from '../../core/BaseTextField';
import { InputClearButton } from '../../core/InputClearButton';

export type TimeInputProps<TFields extends FieldValues> =
  BaseInputProps<TFields> &
    Omit<TimePickerProps<any, any>, 'value' | 'onChange' | 'renderInput'> & {
      onBlur?: TextFieldProps['onBlur'];
      // @ts-ignore
      onChange?: DatePickerProps<string, any>['onChange'];
      helperText?: TextFieldProps['helperText'];
      fullWidth?: TextFieldProps['fullWidth'];
      textFieldProps?: Omit<TextFieldProps, 'name' | 'required' | 'label'>;
      clearable?: boolean;
      sx?: TextFieldProps['sx'];
    };

export default function TimeInput<TFields extends FieldValues>({
  name,
  value: controlledValue,
  required,
  xs,
  sm,
  md,
  lg,
  xl,
  grid,
  helperText,
  textFieldProps,
  fullWidth,
  clearable: clearableProp,
  readOnly: readOnlyProp,
  formFetcherValueResolver,
  formSubmitterValueResolver,
  sx,
  ...rest
}: TimeInputProps<TFields>): JSX.Element {
  const { translations } = useContext(ConfigurationContext);
  const { dense, readOnly: globalReadOnly } = useContext(FormConfigContext);
  const readOnly = globalReadOnly || readOnlyProp;
  const clearable = (clearableProp ?? true) && !rest.disabled && !readOnly;

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
      formFetcherValueResolver={formFetcherValueResolver}
      formSubmitterValueResolver={formSubmitterValueResolver}
      grid={grid}
      rules={{
        validate: (value: string) =>
          !value || value !== 'Invalid Date' || translations!.wrongDateFormat,
      }}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => (
        <TimePicker
          {...rest}
          // @ts-ignore
          value={
            value
              ? dayjs(`1900-01-01T${value}:00`, 'YYYY-MM-DDTHH:mm:ss')
              : null
          }
          readOnly={readOnly}
          // @ts-ignore
          onChange={(newValue, keyboardInputValue) => {
            // @ts-ignore
            const timeStr = newValue ? newValue.format('HH:mm') : null;
            onChange(timeStr, keyboardInputValue);
            if (typeof rest.onChange === 'function') {
              // @ts-ignore
              rest.onChange(timeStr, keyboardInputValue);
            }
          }}
          slotProps={{
            inputAdornment: {
              position: 'start',
            },
            // @ts-ignore
            textField(ownerState) {
              return {
                ...ownerState,
                name,
                readOnly,
                fullWidth: fullWidth ?? true,
                variant: textFieldProps?.variant ?? 'outlined',
                size: dense ? 'small' : undefined,
                autoComplete: 'nope',
                InputProps: {
                  ...ownerState?.InputProps,
                  ...textFieldProps?.InputProps,
                  startAdornment:
                    textFieldProps?.InputProps?.startAdornment ??
                    ownerState?.InputProps?.startAdornment,
                  endAdornment: (
                    <>
                      {clearable && value ? (
                        <InputClearButton
                          onClick={() => onChange({ target: { value: null } })}
                        />
                      ) : null}
                      {ownerState?.InputProps?.endAdornment}
                    </>
                  ),
                },
                // eslint-disable-next-line react/jsx-no-duplicate-props
                inputProps: {
                  ...ownerState?.inputProps,
                  ...textFieldProps?.inputProps,
                },
                onBlur: (event) => {
                  onBlur();
                  if (typeof rest.onBlur === 'function') {
                    rest.onBlur(event);
                  }
                },
                ...textFieldProps,
                required,
                error: !!error,
                helperText: error?.message || helperText || ' ',
                // @ts-ignore
                sx: {
                  ':hover .input-clear-button': { display: 'flex' },
                  ...sx,
                  ...textFieldProps?.sx,
                },
              };
            },
          }}
          slots={{
            textField: BaseTextField,
          }}
        />
      )}
    />
  );
}
