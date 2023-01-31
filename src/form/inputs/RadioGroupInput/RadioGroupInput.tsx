import {
  FormControl,
  FormControlLabel,
  FormControlLabelProps,
  FormHelperText,
  FormLabel,
  MenuItemTypeMap,
  Radio,
  RadioGroup,
  RadioGroupProps,
} from '@mui/material';
import { useContext } from 'react';
import { FieldValues } from 'react-hook-form/dist/types/fields';

import { FormConfigContext } from '../../contexts/FormConfigContext/FormConfigContext';
import { BaseInput, BaseInputProps } from '../../core/BaseInput';

export type RadioGroupItemType = MenuItemTypeMap<object, 'li'>['props'] & {
  text: string;
  value: string | number;
};

export type RadioGroupInputProps<TFields extends FieldValues> =
  BaseInputProps<TFields> &
    Omit<RadioGroupProps, 'name'> & {
      items: RadioGroupItemType[];
      helperText?: string;
      label?: FormControlLabelProps['label'];
      onChange?: (value: any) => void;
    };

export default function RadioGroupInput<TFields extends FieldValues>({
  name,
  value: controlledValue,
  required,
  xs,
  sm,
  md,
  lg,
  xl,
  grid,
  items,
  helperText,
  label,
  readOnly: readOnlyProp,
  ...rest
}: RadioGroupInputProps<TFields>): JSX.Element {
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
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => (
        <FormControl
          required={required}
          error={!!error}
          size={dense ? 'small' : undefined}
          sx={{ ml: 1 }}
          disabled={readOnly}
        >
          {label && (
            <FormLabel
              required={required}
              error={!!error}
              sx={{
                fontSize: '0.8rem',
              }}
            >
              {label}
            </FormLabel>
          )}
          <RadioGroup
            {...rest}
            value={value || null}
            row={rest.row ?? true}
            onChange={(event) => {
              onChange(event);
              if (typeof rest.onChange === 'function') {
                rest.onChange(event);
              }
            }}
            onBlur={onBlur}
            name={name}
          >
            {items.map((item: RadioGroupItemType) => {
              const isChecked = value === item.value;

              return (
                <FormControlLabel
                  control={
                    <Radio
                      sx={{
                        color: error ? 'error.main' : undefined,
                      }}
                      checked={isChecked}
                    />
                  }
                  value={item.value}
                  label={item.text}
                  key={item.value}
                  sx={{
                    height: 34,
                  }}
                />
              );
            })}
          </RadioGroup>
          <FormHelperText>{error?.message || helperText || ' '}</FormHelperText>
        </FormControl>
      )}
    />
  );
}
