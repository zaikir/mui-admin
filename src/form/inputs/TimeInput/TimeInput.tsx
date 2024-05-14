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
          value={value ? dayjs(value, 'HH:mm') : null}
          readOnly={readOnly}
          onChange={(newValue, keyboardInputValue) => {
            const timeStr = newValue ? newValue.format('HH:mm') : null;
            onChange(timeStr, keyboardInputValue);
            if (typeof rest.onChange === 'function') {
              // @ts-ignore
              rest.onChange(timeStr, keyboardInputValue);
            }
          }}
          slots={{
            textField: (params) => (
              <BaseTextField
                {...params}
                name={name}
                fullWidth={fullWidth ?? true}
                variant={textFieldProps?.variant ?? 'outlined'}
                size={dense ? 'small' : undefined}
                disableStartAdorementOffset
                readOnly={readOnly}
                InputProps={{
                  ...params?.InputProps,
                  ...textFieldProps?.InputProps,
                  startAdornment: textFieldProps?.InputProps
                    ?.startAdornment ?? (
                    <InputAdornment position="start">
                      <AccessTime
                        {...((readOnly || rest.disabled) && {
                          htmlColor: 'rgba(55, 65, 81, 0.26)',
                        })}
                      />
                    </InputAdornment>
                  ),
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
            ),
          }}
          // renderInput={(params) => (
          //
          // )}
        />
      )}
    />
  );
}
