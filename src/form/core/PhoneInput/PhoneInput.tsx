import {
  InputAdornment,
  InputBaseComponentProps,
  TextFieldProps,
} from '@mui/material';
import { forwardRef, useContext, useMemo, useRef, useState } from 'react';
import { FieldValues } from 'react-hook-form/dist/types/fields';
import { IMaskInput } from 'react-imask';

import FlagButton from './FlagButton/FlagButton';
import { FlagsMenu } from './FlagsMenu';
import { parsePhone, PhoneTemplates } from './phones';
import { ConfigurationContext } from '../../../contexts/ConfigurationContext';
import { BaseInput, BaseInputProps } from '../BaseInput';
import { BaseTextField } from '../BaseTextField';
import { InputClearButton } from '../InputClearButton';

const MaskedTextField = forwardRef<
  HTMLElement,
  InputBaseComponentProps & {
    country: string;
    blocks?: number[];
    delimiters?: string[];
  }
>((props, ref) => {
  const {
    country,
    countryCode,
    regex,
    definitions,
    onChange,
    value,
    phoneLength,
    ...other
  } = props;

  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData.getData('Text');
    if (!text) {
      return;
    }

    const pastedPhone = text.replace(/[() -+]/g, '');

    if (country !== 'RU') {
      if (pastedPhone.length >= phoneLength) {
        e.preventDefault();

        // @ts-ignore
        onChange({
          target: {
            // @ts-ignore
            name: props.name,
            value: pastedPhone.replace(countryCode, ''),
          },
        });
      }

      return;
    }

    if (
      (pastedPhone.startsWith('8') && pastedPhone.length >= 11) ||
      (pastedPhone.startsWith('+8') && pastedPhone.length >= 12)
    ) {
      e.preventDefault();

      // @ts-ignore
      onChange({
        target: {
          // @ts-ignore
          name: props.name,
          value: `+7${
            text.startsWith('8')
              ? text.replace('8', '')
              : text.replace('+8', '')
          }`,
        },
      });
    }
  };

  const onCopy = (event: React.ClipboardEvent<HTMLInputElement>): void => {
    const currentSelection = window.getSelection();
    if (currentSelection) {
      const valueWithoutSpaces = currentSelection
        .toString()
        .replace(/[() -]/g, '');
      event.clipboardData.setData(
        'text/plain',
        valueWithoutSpaces.length === phoneLength - countryCode.length
          ? `+${countryCode}${valueWithoutSpaces}`
          : valueWithoutSpaces,
      );

      event.preventDefault();
    }
  };

  return (
    <IMaskInput
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...other}
      value={value ? value.replace(countryCode, '') : null}
      mask={regex}
      onPaste={onPaste}
      onCopy={onCopy}
      unmask
      definitions={definitions || {}}
      // @ts-ignore
      inputRef={ref}
      // eslint-disable-next-line @typescript-eslint/no-shadow
      onAccept={(value: any) => {
        if (!value) {
          // @ts-ignore
          onChange({ target: { name: props.name, value: null } });
          return;
        }

        const newValue = `${countryCode}${value}`;
        // @ts-ignore
        onChange({ target: { name: props.name, value: newValue } });
      }}
    />
  );
});

export type InternalPhoneInputProps = {
  defaultCountry?: string;
};

export type PhoneInputProps<TFields extends FieldValues> =
  BaseInputProps<TFields> &
    Omit<TextFieldProps, 'name' | 'type'> &
    InternalPhoneInputProps;

export default function PhoneInput<TFields extends FieldValues>({
  name,
  value: controlledValue,
  required,
  defaultCountry,
  clearable,
  readOnly,
  xs,
  sm,
  md,
  lg,
  xl,
  grid,
  ...rest
}: PhoneInputProps<TFields>): JSX.Element {
  const { translations, defaultPhoneCountry } =
    useContext(ConfigurationContext);

  const [country, setCountry] = useState(
    defaultCountry ?? defaultPhoneCountry!,
  );
  const textFieldRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const isInitializedRef = useRef(false);

  const { countryCode, regex, definitions, placeholder, phoneLength } =
    useMemo(() => {
      const phone = PhoneTemplates.find((x) => x[0] === country.toUpperCase());
      if (!phone) {
        throw new Error(`Unknown country code: ${country}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-shadow
      const countryCode = phone[1];

      // eslint-disable-next-line @typescript-eslint/no-shadow
      const regex = phone[2] ? phone[2] : '0000000000000';

      return {
        countryCode,
        placeholder: regex.replace(/0/g, '#'),
        regex,
        definitions: phone[3] ? phone[3] : undefined,
        phoneLength: phone[2]
          ? regex.replace(/[() -]/g, '').length + countryCode.length
          : -1,
      };
    }, [country]);

  const handleOpenFlagsMenu = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    event.preventDefault();
    if (!rest.disabled && !readOnly) {
      setAnchorEl(textFieldRef.current);
    }
  };

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
        rules={{
          validate: (value: string) => {
            const clearedValue = value || '';
            return (
              !clearedValue.length ||
              phoneLength === -1 ||
              clearedValue.length === phoneLength ||
              translations!.wrongPhoneFormat
            );
          },
        }}
        render={({
          field: { value, onChange, onBlur },
          fieldState: { error },
        }) => {
          if (!isInitializedRef.current) {
            if (value?.length) {
              const parsedCountry = parsePhone(value);
              if (parsedCountry) {
                setTimeout(() => {
                  setCountry(parsedCountry);
                });
              }
            }

            isInitializedRef.current = true;
          }

          return (
            <BaseTextField
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...rest}
              name={name}
              readOnly={readOnly}
              ref={textFieldRef}
              value={value ?? null}
              variant={rest.variant ?? 'outlined'}
              type="tel"
              onChange={(event) => {
                onChange(event);
                if (typeof rest.onChange === 'function') {
                  rest.onChange(event as any);
                }
              }}
              disableStartAdorementOffset
              onBlur={onBlur}
              required={required}
              error={!!error}
              helperText={error?.message || rest.helperText || ' '}
              fullWidth={rest.fullWidth ?? true}
              placeholder={placeholder}
              inputProps={{
                country,
                countryCode,
                regex,
                definitions,
                phoneLength,
              }}
              // eslint-disable-next-line react/jsx-no-duplicate-props
              InputProps={{
                ...rest.InputProps,
                startAdornment: (
                  <>
                    {rest.InputProps?.startAdornment}
                    <InputAdornment
                      position="start"
                      sx={{
                        color: rest.disabled ? 'text.disabled' : 'text.primary',
                      }}
                    >
                      <FlagButton
                        disabled={rest.disabled}
                        isFlagsMenuOpened={Boolean(anchorEl)}
                        isoCode={country}
                        onClick={handleOpenFlagsMenu}
                        sx={{ marginLeft: -1 }}
                      />
                      {`+${countryCode}`}
                    </InputAdornment>
                  </>
                ),
                inputComponent:
                  rest.InputProps?.inputComponent ?? MaskedTextField,
                endAdornment: (
                  <>
                    {clearable && value ? (
                      <InputClearButton
                        onClick={() => onChange({ target: { value: '' } })}
                      />
                    ) : null}
                    {rest.InputProps?.endAdornment}
                  </>
                ),
              }}
            />
          );
        }}
      />
      <FlagsMenu
        anchorEl={anchorEl}
        selectedCountry={country}
        onSelectCountry={(value: string) => {
          setCountry(value);
          setAnchorEl(null);
        }}
        onClose={() => setAnchorEl(null)}
      />
    </>
  );
}
