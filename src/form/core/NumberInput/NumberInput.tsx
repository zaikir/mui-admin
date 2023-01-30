import { forwardRef, useContext } from "react";
import { IMaskInput } from "react-imask";

import { ConfigurationContext } from "../../../contexts/ConfigurationContext";

export type InternalNumberInputProps = {
  scale?: number;
  eager?: boolean;
  lazy?: boolean;
  min?: number;
  max?: number;
  padFractionalZeros?: boolean;
  unmask?: boolean | "typed";
  parse?: boolean;
  thousandsSeparator?: string;
};

export const InternalNumberInput = forwardRef<
  HTMLElement,
  InternalNumberInputProps & {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
  }
>((props, ref) => {
  const {
    // @ts-ignore
    // eslint-disable-next-line react/prop-types
    value,
    onChange,
    parse,
    // @ts-ignore
    type,
    ...other
  } = props;

  const { thousandsSeparator, decimalSeparator } =
    useContext(ConfigurationContext);

  return (
    <IMaskInput
      value={value != null ? value.toString() : null}
      {...other}
      // @ts-ignore
      inputRef={ref}
      onAccept={(x: any) => {
        const newValue = (() => {
          if (x == null || (typeof x === "string" && !x.trim().length)) {
            // @ts-ignore
            return parse ?? true ? null : x;
          }

          return parse ?? true ? parseFloat(x) : x;
        })();

        if (value !== newValue) {
          // @ts-ignore
          onChange({ target: { value: newValue } });
        }
      }}
      unmask={other.unmask ?? true}
      mask={Number}
      thousandsSeparator={other.thousandsSeparator ?? thousandsSeparator}
      radix={decimalSeparator}
      scale={3}
      inputMode="numeric"
      pattern="[0-9]*"
    />
  );
});
