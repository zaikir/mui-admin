import {
  Checkbox,
  CheckboxProps,
  FormControl,
  FormControlLabel,
  FormControlLabelProps,
  FormGroup,
  FormHelperText,
  Switch,
} from '@mui/material';
import { useContext } from 'react';
import { FieldValues } from 'react-hook-form/dist/types/fields';

import { FormConfigContext } from '../../contexts/FormConfigContext/FormConfigContext';
import { BaseInput, BaseInputProps } from '../../core/BaseInput';

export type CheckboxInputProps<TFields extends FieldValues> =
  BaseInputProps<TFields> &
    Omit<CheckboxProps, 'name'> & {
      label?: FormControlLabelProps['label'];
      helperText?: string;
      variant?: 'checkbox' | 'switch';
    };

export default function CheckboxInput<TFields extends FieldValues>({
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
  variant,
  readOnly: readOnlyProp,
  formFetcherValueResolver,
  formSubmitterValueResolver,
  ...rest
}: CheckboxInputProps<TFields>): JSX.Element {
  const ControlComponent = variant === 'switch' ? Switch : Checkbox;
  const { dense, readOnly: globalReadOnly } = useContext(FormConfigContext);
  const readOnly = globalReadOnly ?? readOnlyProp;

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
      }) => (
        <FormControl
          required={required}
          error={!!error}
          size={dense ? 'small' : rest.size}
        >
          <FormGroup row>
            <FormControlLabel
              label={label ?? ''}
              sx={{ userSelect: 'none' }}
              control={
                <ControlComponent
                  {...rest}
                  name={name}
                  color={rest.color ?? 'primary'}
                  sx={{
                    ...rest.sx,
                    color: error ? 'error.main' : undefined,
                  }}
                  value={value ?? false}
                  checked={!!value}
                  onChange={() => {
                    if (readOnly) {
                      return;
                    }
                    onChange(!value);
                  }}
                  onBlur={onBlur}
                  readOnly={readOnly}
                />
              }
            />
          </FormGroup>
          <FormHelperText error={!!error}>
            {error?.message || helperText || ' '}
          </FormHelperText>
        </FormControl>
      )}
    />
  );
}
