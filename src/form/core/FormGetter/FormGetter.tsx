import { useEffect, useMemo, useRef } from 'react';
import { useWatch } from 'react-hook-form';

export default function FormGetter(props: {
  names?: string[];
  render?: (values: any) => React.ReactNode;
  onChange?: (values: any, prevValues?: any) => void;
}) {
  const { names, render, onChange } = props;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const values = names ? useWatch({ name: names }) : useWatch();
  const prevValuesRef = useRef<any>();

  const processedValues = names
    ? Object.fromEntries(names.map((name, idx) => [name, values[idx]]))
    : values;

  const memoizationKey = JSON.stringify(processedValues);

  useEffect(() => {
    if (onChange) {
      onChange(processedValues, prevValuesRef.current);
    }

    prevValuesRef.current = processedValues;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoizationKey]);

  const memoizedContent = useMemo(
    () => (!render ? null : (render(processedValues) as JSX.Element)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [render, memoizationKey],
  );

  return memoizedContent;
}
