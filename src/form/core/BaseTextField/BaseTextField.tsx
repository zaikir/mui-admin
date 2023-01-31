import { TextField, TextFieldProps } from '@mui/material';
import { forwardRef, Ref, useContext, useEffect, useState } from 'react';

import { FormConfigContext } from '../../contexts/FormConfigContext';

export type BaseTextFieldProps = TextFieldProps & {
  disableStartAdorementOffset?: boolean;
  readOnly?: boolean;
};

const BaseTextField = forwardRef(
  (props: BaseTextFieldProps, ref: Ref<HTMLDivElement>) => {
    const {
      disableStartAdorementOffset,
      readOnly: readOnlyProp,
      ...rest
    } = props;
    const [shrinkLabel, setShrinkLabel] = useState<boolean>(rest.value != null);
    const { readOnly: globalReadOnly } = useContext(FormConfigContext);
    const isStartAdornmentExists =
      !!rest.InputProps?.startAdornment &&
      !(disableStartAdorementOffset ?? false);
    const readOnly = globalReadOnly || readOnlyProp;

    // @ts-ignore
    const isDisabled = (rest.disabled ||
      readOnly ||
      rest.InputProps?.readOnly) as boolean;

    useEffect(() => {
      if (!isStartAdornmentExists) {
        return;
      }

      setShrinkLabel(rest.value != null);
    }, [isStartAdornmentExists, rest.value]);

    return (
      <TextField
        {...rest}
        ref={ref}
        focused={readOnly === true ? false : rest.focused}
        sx={{
          ...(isStartAdornmentExists && {
            '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
              transform: 'translate(48px, 17px)',
            },
          }),
          ...(readOnly && {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#e6e8f0 !important',
            },
          }),
          ...rest.sx,
        }}
        onFocus={(e) => {
          if (isStartAdornmentExists && !isDisabled) {
            setShrinkLabel(true);
          }

          if (rest.onFocus) {
            rest.onFocus(e);
          }
        }}
        onBlur={(e) => {
          if (
            isStartAdornmentExists &&
            !isDisabled &&
            (e.target.value == null || e.target.value === '')
          ) {
            setShrinkLabel(false);
          }

          if (rest.onBlur) {
            rest.onBlur(e);
          }
        }}
        InputLabelProps={{
          ...(isStartAdornmentExists && {
            shrink: rest.InputLabelProps?.shrink ?? shrinkLabel,
          }),
          ...rest.InputLabelProps,
        }}
        InputProps={{
          ...rest.InputProps,
          readOnly,
        }}
      />
    );
  },
);

export default BaseTextField;
