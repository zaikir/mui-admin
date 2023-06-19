import {
  forwardRef,
  Ref,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
} from 'react';
import { useFormContext } from 'react-hook-form';

import { FormConfigContext } from 'form/contexts/FormConfigContext';

import { FormFetcherContext } from '../../contexts/FormFetcherContext';
import { BaseInput } from '../BaseInput';

export type HasuraSelectorRef = {
  refetch: () => Promise<any>;
};

const HasuraSelector = forwardRef(
  (
    props: {
      name?: string | string[];
      selection: string;
      flattenSelections?: boolean;
      resolveValue?: (item: Record<string, any>) => any;
      refetchOnSubmit?: boolean;
    },
    ref: Ref<HasuraSelectorRef>,
  ) => {
    const formFetcherContext = useContext(FormFetcherContext);
    const { subscribeFormSubmit } = useContext(FormConfigContext);
    const { setValue } = useFormContext();
    const {
      name,
      selection,
      flattenSelections,
      refetchOnSubmit,
      resolveValue,
    } = props;

    const names =
      typeof name === 'string' || !name ? [name ?? selection] : name;

    const selectorName = `selector_${names.join(' ')}`;

    const refetch = useCallback(async () => {
      if (!formFetcherContext) {
        return;
      }

      const result = await formFetcherContext.refetch([selectorName]);
      names.forEach((key) => {
        setValue(key, result[key]);
      });

      return result;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name, names, formFetcherContext, flattenSelections, setValue]);

    useImperativeHandle(
      ref,
      () => ({
        refetch,
      }),
      [refetch],
    );

    useEffect(() => {
      if (!refetchOnSubmit) {
        return;
      }

      return subscribeFormSubmit(refetch);
    }, [subscribeFormSubmit, refetch, refetchOnSubmit]);

    return (
      <>
        <BaseInput
          name={selectorName}
          skeleton={false}
          grid={false}
          render={() => null as any}
          formSubmitterValueResolver={null}
          formFetcherValueResolver={{
            selection: `${selection}`,
            resolveValue:
              resolveValue ??
              ((item) =>
                Object.assign({}, ...names.map((x) => ({ [x]: item[x] })))),
          }}
        />
        {names.map((key) => (
          <BaseInput
            key={key}
            name={key}
            skeleton={false}
            grid={false}
            render={() => null as any}
            formSubmitterValueResolver={null}
            formFetcherValueResolver={null}
          />
        ))}
      </>
    );
  },
);

export default HasuraSelector;
