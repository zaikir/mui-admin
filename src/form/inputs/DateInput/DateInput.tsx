import { TextField, TextFieldProps } from '@mui/material';
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { useContext } from 'react';
import { FieldValues } from 'react-hook-form/dist/types/fields';

import { ConfigurationContext } from '../../../contexts/ConfigurationContext';
import { FormConfigContext } from '../../contexts/FormConfigContext/FormConfigContext';
import { BaseInput, BaseInputProps } from '../../core/BaseInput';
import { InputClearButton } from '../../core/InputClearButton';

export type DateInputProps<TFields extends FieldValues> =
  BaseInputProps<TFields> &
    Omit<DatePickerProps<any, any>, 'value' | 'onChange' | 'renderInput'> & {
      onBlur?: TextFieldProps['onBlur'];
      onChange?: DatePickerProps<string, any>['onChange'];
      helperText?: TextFieldProps['helperText'];
      fullWidth?: TextFieldProps['fullWidth'];
      textFieldProps?: Omit<TextFieldProps, 'name' | 'required' | 'label'>;
      clearable?: boolean;
      sx?: TextFieldProps['sx'];
    };

export default function DateInput<TFields extends FieldValues>({
  name,
  value: controlledValue,
  required,
  grid,
  xs,
  sm,
  md,
  lg,
  xl,
  helperText,
  textFieldProps,
  fullWidth,
  clearable: clearableProp,
  readOnly: readOnlyProp,
  formFetcherValueResolver,
  formSubmitterValueResolver,
  sx,
  ...rest
}: DateInputProps<TFields>): JSX.Element {
  const { translations } = useContext(ConfigurationContext);
  const { dense, readOnly: globalReadOnly } = useContext(FormConfigContext);
  const readOnly = globalReadOnly || readOnlyProp;
  const clearable = !!((clearableProp ?? true) && !rest.disabled && !readOnly);

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
        <DatePicker
          {...rest}
          value={value ? dayjs(value, 'YYYY-MM-DD') : null}
          readOnly={readOnly}
          InputAdornmentProps={{
            position: 'start',
          }}
          onChange={(newValue: Dayjs | null, keyboardInputValue) => {
            const dateStr = newValue ? newValue.format('YYYY-MM-DD') : null;

            onChange(dateStr, keyboardInputValue);
            if (typeof rest.onChange === 'function') {
              rest.onChange(dateStr, keyboardInputValue);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              name={name}
              readOnly={readOnly}
              fullWidth={fullWidth ?? true}
              variant={textFieldProps?.variant ?? 'outlined'}
              size={dense ? 'small' : undefined}
              autoComplete="nope"
              InputProps={{
                ...params?.InputProps,
                ...textFieldProps?.InputProps,
                startAdornment:
                  (textFieldProps?.InputProps?.startAdornment,
                  params?.InputProps?.startAdornment),
                endAdornment: (
                  <>
                    {clearable && value ? (
                      <InputClearButton
                        onClick={() => onChange({ target: { value: null } })}
                      />
                    ) : null}
                    {params?.InputProps?.endAdornment}
                  </>
                ),
              }}
              // eslint-disable-next-line react/jsx-no-duplicate-props
              inputProps={{
                ...params?.inputProps,
                ...textFieldProps?.inputProps,
              }}
              onBlur={(event) => {
                onBlur();
                if (typeof rest.onBlur === 'function') {
                  rest.onBlur(event);
                }
              }}
              {...textFieldProps}
              required={required}
              error={!!error}
              helperText={error?.message || helperText || ' '}
              // @ts-ignore
              sx={{
                ':hover .input-clear-button': { display: 'flex' },
                ...sx,
                ...textFieldProps?.sx,
              }}
            />
          )}
        />
      )}
    />
  );
}
