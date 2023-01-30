import { forwardRef } from "react";
import { IMaskInput } from "react-imask";

export type MaskedInputProps = Pick<
  React.ComponentProps<typeof IMaskInput>,
  "overwrite" | "eager" | "mask" | "unmask"
>;

export const MaskedInput = forwardRef<
  HTMLElement,
  MaskedInputProps & {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
  }
>((props, ref) => {
  const {
    // @ts-ignore
    // eslint-disable-next-line react/prop-types
    value,
    onChange,
    // @ts-ignore
    parseString,
    ...other
  } = props;

  return (
    <IMaskInput
      value={value != null ? value.toString() : null}
      {...other}
      // @ts-ignore
      inputRef={ref}
      // @ts-ignore
      onAccept={(x) => onChange({ target: { value: x } })}
      unmask={other.unmask ?? true}
    />
  );
});
