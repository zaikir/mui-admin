import { useEffect, useRef } from "react";
import { useFormState, UseFormStateProps } from "react-hook-form";

export default function FormErrorsListener(
  props: {
    onErrors: (errors: { name: string; text?: string }[]) => void;
    onSubmit?: () => void;
  } & UseFormStateProps<any>
) {
  const { onErrors, onSubmit, ...rest } = props;
  const formState = useFormState(rest);
  const prevErrors = useRef<any>(null);
  const prevSubmitCount = useRef<number>(0);

  useEffect(() => {
    const errors = Object.entries(formState.errors).map((x) => ({
      name: x[0],
      text: x[1]?.message?.toString(),
    }));

    if (!errors.length) {
      return;
    }

    if (
      prevErrors.current &&
      JSON.stringify(prevErrors.current) === JSON.stringify(errors)
    ) {
      return;
    }

    onErrors(errors);

    prevErrors.current = errors;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]);

  useEffect(() => {
    if (!onSubmit || formState.submitCount === prevSubmitCount.current) {
      return;
    }

    onSubmit();
    prevSubmitCount.current = formState.submitCount;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]);

  return null;
}
