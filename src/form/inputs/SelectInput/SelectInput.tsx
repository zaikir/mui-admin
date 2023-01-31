import {
  MenuItem,
  MenuItemTypeMap,
  TextField,
  TextFieldProps,
} from '@mui/material';
import { useContext } from 'react';
import { FieldValues } from 'react-hook-form/dist/types/fields';

import { ConfigurationContext } from '../../../contexts/ConfigurationContext';
import { FormConfigContext } from '../../contexts/FormConfigContext/FormConfigContext';
import { BaseInput, BaseInputProps } from '../../core/BaseInput';
import { InputClearButton } from '../../core/InputClearButton';

export type SelectMenuItemType = MenuItemTypeMap<object, 'li'>['props'] & {
  value: string | number;
} & ({ text: string } | { children: React.ReactNode });

export type SelectInputProps<TFields extends FieldValues> =
  BaseInputProps<TFields> &
    Omit<TextFieldProps, 'name' | 'type'> & {
      nullable?: boolean;
      nullOptionText?: string;
      items: SelectMenuItemType[];
      hideArrow?: boolean;
    };

export default function SelectInput<TFields extends FieldValues>({
  name,
  value: controlledValue,
  required,
  xs,
  sm,
  md,
  lg,
  xl,
  grid,
  nullable,
  nullOptionText,
  items,
  clearable,
  readOnly: readOnlyProp,
  hideArrow,
  ...rest
}: SelectInputProps<TFields>): JSX.Element {
  const { translations } = useContext(ConfigurationContext);
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
        <TextField
          {...rest}
          name={name}
          value={value === null || value === undefined ? '' : value}
          variant={rest.variant ?? 'outlined'}
          size={dense ? 'small' : rest.size}
          onChange={(event) => {
            if (event.target.value === '') {
              // @ts-ignore
              // eslint-disable-next-line no-param-reassign
              event.target.value = null;
            }

            onChange(event);
            if (typeof rest.onChange === 'function') {
              rest.onChange(event);
            }
          }}
          onBlur={onBlur}
          required={required}
          error={!!error}
          helperText={error?.message || rest.helperText || ' '}
          fullWidth={rest.fullWidth ?? true}
          select
          {...(hideArrow && {
            SelectProps: {
              IconComponent: () => null,
            },
          })}
          InputProps={{
            ...rest.InputProps,
            endAdornment: (
              <>
                {clearable && value && !rest.disabled && !readOnly ? (
                  <InputClearButton
                    onClick={() => onChange({ target: { value: null } })}
                    sx={{ marginRight: 2.7 }}
                  />
                ) : null}
                {rest.InputProps?.endAdornment}
              </>
            ),
          }}
          sx={{
            ':hover .input-clear-button': { display: 'flex' },
            ...rest.sx,
          }}
        >
          {nullable && (
            <MenuItem value="">
              <em>{nullOptionText || translations!.nullSelectOptionText}</em>
            </MenuItem>
          )}
          {items.map((item) => (
            <MenuItem key={item.value} {...item}>
              {'text' in item ? item.text : item.children}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
