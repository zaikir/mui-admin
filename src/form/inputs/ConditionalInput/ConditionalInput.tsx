import { useEffect, useMemo, useRef } from "react";
import { useWatch } from "react-hook-form";

import { HiddenInput } from "../HiddenInput";

type VariantInputChildren = React.ReactElement | React.ReactElement[];
type VariantInput =
  | ((values: Record<string, any>) => VariantInputChildren)
  | VariantInputChildren;

const renderInput = (input: VariantInput, values: Record<string, any>) => {
  if (typeof input === "function") {
    return input(values);
  }

  return input;
};

export default function ConditionalInput(props: {
  deps?: string[];
  variants: {
    if: (values: Record<string, any>) => boolean;
    input:
      | ((values: Record<string, any>) => React.ReactElement)
      | React.ReactElement;
    keepMounted?: boolean;
  }[];
  memoize?: boolean;
  onChange?: (values: any, prevValues?: any) => void;
}) {
  const { deps, variants, memoize, onChange } = props;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const values = deps ? useWatch({ name: deps }) : useWatch();
  const prevValuesRef = useRef<any>();

  const processedValues = deps
    ? Object.fromEntries(deps.map((name, idx) => [name, values[idx]]))
    : values;

  const memoizationKey = JSON.stringify(processedValues);

  const memoizedContent = useMemo(() => {
    const activeVariant = variants.find((x) => x.if(processedValues));
    const hiddenVariants = variants.filter((x) => x !== activeVariant);

    return (
      <>
        {activeVariant && renderInput(activeVariant.input, processedValues)}
        {hiddenVariants
          .filter((x) => x.keepMounted ?? true)
          .map((x) => {
            const input = renderInput(x.input, processedValues);
            return {
              if: x.if,
              // @ts-ignore
              input: input.props.children ? input.props.children : input,
            };
          })
          .map((x) => ({
            if: x.if,
            input: "length" in x.input ? x.input : [x.input],
          }))
          .filter((x) => !!x.input.length)
          .map((x) =>
            // @ts-ignore
            x.input.map((input, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <HiddenInput
                key={`${x.if.toString()}_${idx}`}
                name={input.props.name}
              />
            ))
          )}
      </>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoize ?? true ? memoizationKey : processedValues]);

  useEffect(() => {
    if (onChange) {
      onChange(processedValues, prevValuesRef.current);
    }

    prevValuesRef.current = processedValues;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoizationKey]);

  return memoizedContent as JSX.Element;
}
