import {
  Box,
  IconButton,
  InputAdornment,
  Menu,
  Skeleton,
  TextFieldProps,
  Tooltip,
} from '@mui/material';
import { TrashCan } from 'mdi-material-ui';
import { useContext, useEffect, useState } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { FieldValues } from 'react-hook-form/dist/types/fields';

import { FormConfigContext } from 'form/contexts/FormConfigContext';
import { BaseInput, BaseInputProps } from 'form/core/BaseInput';
import { BaseTextField } from 'form/core/BaseTextField';
import { InputClearButton } from 'form/core/InputClearButton';

export type ColorInputProps<TFields extends FieldValues> =
  BaseInputProps<TFields> &
    Omit<TextFieldProps, 'name' | 'type'> & {
      fetchColors?: () => Promise<string[]>;
    };

export default function ColorInput<TFields extends FieldValues>({
  name,
  value: controlledValue,
  required,
  xs,
  sm,
  md,
  lg,
  xl,
  grid,
  clearable: clearableProp,
  readOnly: readOnlyProp,
  fetchColors,
  ...rest
}: ColorInputProps<TFields>): JSX.Element {
  const { dense, readOnly: globalReadOnly } = useContext(FormConfigContext);
  const readOnly = globalReadOnly || readOnlyProp;
  const textFieldProps = rest;
  const inputProps: any = {};
  const InputComponent: any = null;

  // eslint-disable-next-line max-len
  const clearable = !!(!rest.disabled && !readOnly);

  const [colors, setColors] = useState<string[] | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isColorPickerOpened = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!clearable) {
      return;
    }

    setAnchorEl(event.currentTarget);
  };

  useEffect(() => {
    if (!anchorEl || colors) {
      return;
    }

    (async () => {
      if (!fetchColors) {
        setColors([]);
        return;
      }

      const items = await fetchColors();
      setColors(items);
    })();
  }, [anchorEl, colors]);

  return (
    <>
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
          <>
            <BaseTextField
              {...(textFieldProps as any)}
              name={name}
              type="text"
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
              readOnly
              placeholder="Not set"
              InputProps={{
                ...textFieldProps.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 0.5,
                        bgcolor: value || 'white',
                        border: 'thin solid #cccccc',
                        ...(clearable && { cursor: 'pointer' }),
                        ...(!value && {
                          backgroundImage: `linear-gradient(45deg, #ddd 25%, transparent 25%, transparent 50%, #ddd 50%, #ddd 75%, transparent 75%, #fff)`,
                          backgroundSize: `7px 7px`,
                        }),
                      }}
                    />
                  </InputAdornment>
                ),
                endAdornment: (
                  <>
                    {clearable && value && !rest.disabled && !readOnly ? (
                      <InputClearButton
                        onClick={() => {
                          onChange({ target: { value: null } });
                          setTimeout(() => {
                            setAnchorEl(null);
                          }, 1);
                        }}
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
                cursor: 'pointer',
                ...rest.sx,
              }}
              onClick={handleClick}
            />
            <Menu
              anchorEl={anchorEl}
              open={isColorPickerOpened}
              onClose={() => {
                setAnchorEl(null);
              }}
              MenuListProps={{
                disablePadding: true,
                sx: { overflow: 'hidden' },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  '.react-colorful__hue, .react-colorful__saturation': {
                    borderRadius: 0,
                  },
                }}
              >
                <HexColorPicker
                  color={value || '#FFFFFF'}
                  onChange={(newColor) => {
                    onChange({ target: { value: newColor } });
                  }}
                  style={{ borderRadius: 0 }}
                />
                <Box
                  sx={{
                    width: 200,
                    p: 1,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ display: 'flex' }}>
                    <HexColorInput
                      color={value || '#FFFFFF'}
                      onChange={(x) => onChange({ target: { value: x } })}
                      placeholder="FFFFFF"
                      style={{
                        fontFamily: 'inherit',
                        fontSize: '16px',
                        paddingLeft: 14,
                        paddingTop: 12,
                        paddingBottom: 12,
                        width: '100%',
                        borderColor: '#e6e8f0',
                        borderRadius: 8,
                        border: 'thin solid #e6e8f0',
                        marginRight: 10,
                      }}
                    />
                    {clearable && (
                      <Tooltip title="Clear">
                        <IconButton
                          onClick={() => {
                            onChange({ target: { value: null } });
                            setAnchorEl(null);
                          }}
                        >
                          <TrashCan />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                  <Box
                    sx={{
                      flex: '1 1 0',
                      overflowY: 'auto',
                      pb: 1,
                      pt: 2,
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignContent: 'flex-start',
                    }}
                  >
                    {!colors &&
                      [0, 1, 2, 3, 4, 5].map((idx) => (
                        <Skeleton
                          key={idx}
                          variant="rectangular"
                          sx={{
                            width: 38,
                            height: 25,
                            mb: 1,
                            mr: 1,
                            borderRadius: 0.5,
                          }}
                        />
                      ))}
                    {(colors || []).map((color) => (
                      <Box
                        key={color}
                        component="button"
                        onClick={() => {
                          onChange({ target: { value: color } });
                          setAnchorEl(null);
                        }}
                        sx={{
                          width: 38,
                          height: 25,
                          bgcolor: color,
                          borderRadius: 0.5,
                          border: 'thin solid #ddd',
                          mb: 1,
                          mr: 1,
                          cursor: 'pointer',
                          ':hover': {
                            border: 'thin solid #aaa',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Menu>
          </>
        )}
      />
    </>
  );
}
