import { Box, FormHelperText, TextFieldProps, Typography } from '@mui/material';
import { DatePickerProps } from '@mui/x-date-pickers';
import { MuiOtpInput } from '@zaidulin_kirill/mui-otp-input';
import { useRef } from 'react';
import { FieldValues } from 'react-hook-form/dist/types/fields';

import { BaseInput, BaseInputProps } from '../../core/BaseInput';

type MuiOtpInputProps = React.ComponentProps<typeof MuiOtpInput>;

export type VerificationCodeInputProps<TFields extends FieldValues> =
  BaseInputProps<TFields> &
    MuiOtpInputProps & {
      onBlur?: TextFieldProps['onBlur'];
      onChange?: DatePickerProps<string, any>['onChange'];
      helperText?: TextFieldProps['helperText'];
      sx?: TextFieldProps['sx'];
      autoFocus?: boolean;
      label?: TextFieldProps['label'];
    };

export default function VerificationCodeInput<TFields extends FieldValues>({
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
  sx,
  autoFocus,
  label,
  ...rest
}: VerificationCodeInputProps<TFields>): JSX.Element {
  const submitButtonRef = useRef<any>();

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
      }) => (
        <Box>
          <Box
            ref={submitButtonRef}
            component="button"
            sx={{ display: 'none' }}
            type="submit"
            area-hidden
          />
          {label && (
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {label}
            </Typography>
          )}
          <MuiOtpInput
            {...rest}
            value={value || ''}
            onComplete={() => {
              submitButtonRef.current.click();
            }}
            onBlur={(e) => {
              onBlur();
              if (typeof rest.onBlur === 'function') {
                rest.onBlur(e);
              }
            }}
            onChange={(newValue) => {
              onChange(newValue);
              if (typeof rest.onChange === 'function') {
                rest.onChange(newValue);
              }
            }}
          />
          <FormHelperText error={!!error}>
            {error?.message || helperText}
          </FormHelperText>
        </Box>
      )}
    />
  );
}
