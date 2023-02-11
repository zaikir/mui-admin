import { useContext } from 'react';
import { FieldValues } from 'react-hook-form/dist/types/fields';

import { FormConfigContext } from 'form/contexts/FormConfigContext';

import FileAttachmentZone from './FileAttachmentZone';
import { FileInputProps } from './FileInput.types';
import { BaseInput } from '../../core/BaseInput';

export default function FileInput<TFields extends FieldValues>({
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
  clearable: clearableProp,
  readOnly: readOnlyProp,
  sx,
  ...rest
}: FileInputProps<TFields>): JSX.Element {
  const { readOnly: globalReadOnly } = useContext(FormConfigContext);
  const readOnly = globalReadOnly || readOnlyProp || rest.disabled;
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
      grid={grid}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => (
        <FileAttachmentZone
          fileId={value}
          required={required}
          clearable={clearable}
          readOnly={readOnly}
          helperText={error?.message || helperText}
          error={!!error}
          {...rest}
          onChange={(newId) => {
            onChange({ target: { value: newId } });
          }}
        />
      )}
    />
  );
}
