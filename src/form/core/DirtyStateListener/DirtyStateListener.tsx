import { useEffect, useMemo } from "react";
import { useFormState, UseFormStateProps } from "react-hook-form";

export default function DirtyStateListener(
  props: { onChange: (isDirty: boolean) => void } & UseFormStateProps<any>
) {
  const { onChange, ...rest } = props;
  const formState = useFormState(rest);

  const isDirty = useMemo(() => {
    const dirtyFields = Object.entries(formState.dirtyFields).filter(
      (x) => !!x[1]
    );
    return dirtyFields.length > 0;
  }, [formState]);

  useEffect(() => {
    onChange(isDirty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty]);

  return null;
}
