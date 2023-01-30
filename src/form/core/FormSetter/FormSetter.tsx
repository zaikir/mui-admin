import { useFormContext, UseFormSetValue } from "react-hook-form";

export default function FormSetter(props: {
  render: (setValue: UseFormSetValue<any>) => React.ReactNode;
}) {
  const { render } = props;
  const { setValue } = useFormContext();

  return render(setValue) as JSX.Element;
}
