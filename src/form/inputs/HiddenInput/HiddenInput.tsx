import { BaseInput } from "../../core/BaseInput";

export default function HiddenInput({ name }: { name: string }): JSX.Element {
  return (
    <BaseInput
      name={name}
      skeleton={false}
      grid={false}
      render={() => null as any}
    />
  );
}
