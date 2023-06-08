import { forwardRef, useContext } from 'react';
import { IMaskInput } from 'react-imask';

import { ConfigurationContext } from '../../../contexts/ConfigurationContext';

export type InternalNumberInputProps = {
  scale?: number;
  eager?: boolean;
  lazy?: boolean;
  min?: number;
  max?: number;
  unmask?: 'typed' | boolean;
  signed?: boolean;
  padFractionalZeros?: boolean;
  thousandsSeparator?: string;
};

export const InternalNumberInput = forwardRef<
  HTMLElement,
  InternalNumberInputProps &
    Omit<HTMLInputElement, 'value'> & {
      value: number | null;
      onChange: (event: { target: { value: string | number | null } }) => void;
    }
>((props, ref) => {
  const { value, onChange, type, unmask, signed, ...other } = props;

  const { thousandsSeparator, decimalSeparator } =
    useContext(ConfigurationContext);

  return (
    <IMaskInput
      {...other}
      value={value === null ? '' : value}
      inputRef={ref as any}
      onAccept={(newValue: unknown, mask) => {
        if (value === newValue) {
          return;
        }

        if (unmask === false || unmask === true) {
          onChange({ target: { value: newValue as any } });
          return;
        }

        if (
          newValue === null ||
          typeof newValue !== 'number' ||
          !mask.unmaskedValue
        ) {
          onChange({ target: { value: null } });
          return;
        }

        onChange({ target: { value: newValue } });
      }}
      unmask={unmask ?? (value === null ? false : 'typed')}
      mask={Number}
      format={(v: any) => (v == null ? '' : v)}
      thousandsSeparator={other.thousandsSeparator ?? thousandsSeparator}
      radix={decimalSeparator}
      scale={3}
      signed={signed ?? false}
      {...({
        inputMode: 'numeric',
        pattern: '[0-9]*',
      } as Partial<HTMLInputElement>)}
    />
  );
});
