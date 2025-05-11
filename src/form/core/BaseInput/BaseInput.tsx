import { Skeleton } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useContext, useEffect } from 'react';
import {
  Controller,
  ControllerFieldState,
  ControllerProps,
  ControllerRenderProps,
  FieldValues,
  Path,
  UseFormStateReturn,
} from 'react-hook-form';

import { ConfigurationContext } from '../../../contexts/ConfigurationContext';
import { FormFetcherHasuraFieldResolver } from '../../contexts/FormFetcherContext';
import { FormFetcherContext } from '../../contexts/FormFetcherContext/FormFetcherContext';
import {
  FormSubmitterContext,
  FormSubmitterValueResolver,
} from '../../contexts/FormSubmitterContext';
import { FormTabContext } from '../../contexts/FormTabContext';
import { FormTabsContext } from '../../contexts/FormTabsContext';

type GridProps = React.ComponentProps<typeof Grid>;

export type InputGridProps = {
  grid?: boolean;
  xs?: GridProps['xs'];
  sm?: GridProps['sm'];
  md?: GridProps['md'];
  lg?: GridProps['lg'];
  xl?: GridProps['xl'];
};

export type BaseInputProps<TFields extends FieldValues> = {
  name: Path<TFields>;
  required?: boolean;
  // eslint-disable-next-line react/no-unused-prop-types
  readOnly?: boolean;
  // eslint-disable-next-line react/no-unused-prop-types
  clearable?: boolean;
  formFetcherValueResolver?: FormFetcherHasuraFieldResolver;
  formSubmitterValueResolver?: FormSubmitterValueResolver;
  // controlled mode
  value?: any;
  rules?: ControllerProps['rules'];
} & InputGridProps;

export type InputProps<TFields extends FieldValues> =
  BaseInputProps<TFields> & {
    render: (props: BaseInputRenderProps<TFields>) => React.ReactElement;
    rules?: ControllerProps['rules'];
    skeleton?: boolean;
  };

export type BaseInputRenderProps<Entity> = {
  skeleton?: boolean;
  field: ControllerRenderProps<FieldValues, Path<Entity>>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<FieldValues>;
};

export default function BaseInput<TFields extends FieldValues>({
  name,
  required,
  render,
  rules,
  xs,
  sm,
  md,
  lg,
  xl,
  grid,
  skeleton,
  formFetcherValueResolver,
  formSubmitterValueResolver,
  // controlled mode
  value,
}: InputProps<TFields>): JSX.Element {
  const isControlledModeEnabled = value !== undefined;

  const { translations } = useContext(ConfigurationContext);
  const formFetcherContext = useContext(FormFetcherContext);
  const formSubmitterContext = useContext(FormSubmitterContext);
  const formTabContext = useContext(FormTabContext);
  const formTabsContext = useContext(FormTabsContext);

  useEffect(() => {
    if (!formFetcherContext || isControlledModeEnabled) {
      return;
    }

    formFetcherContext.register(
      formFetcherValueResolver || formFetcherValueResolver === null
        ? { name, resolver: formFetcherValueResolver }
        : name,
    );

    return () => {
      formFetcherContext.unregister(name);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, formFetcherContext, isControlledModeEnabled]);

  useEffect(() => {
    if (
      !formSubmitterContext ||
      formSubmitterValueResolver === undefined ||
      isControlledModeEnabled
    ) {
      return;
    }

    formSubmitterContext.register({
      name,
      resolver: formSubmitterValueResolver,
    });

    return () => {
      formSubmitterContext.unregister(name);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, formSubmitterContext, isControlledModeEnabled]);

  useEffect(() => {
    if (!formTabContext || !formTabsContext || isControlledModeEnabled) {
      return;
    }

    formTabsContext.register(name, formTabContext.tab);

    return () => {
      formTabsContext.unregister(name);
    };
  }, [name, formTabContext, formTabsContext, isControlledModeEnabled]);

  // eslint-disable-next-line no-nested-ternary
  const content = !isControlledModeEnabled ? (
    <Controller
      name={name}
      rules={{
        required: required && translations!.valueRequired,
        ...rules,
      }}
      render={
        !formFetcherContext ||
        formFetcherContext.fetchedEntity ||
        !(skeleton ?? true)
          ? render
          : () => (
              <Skeleton>
                {render({
                  // @ts-ignore
                  field: { value: null },
                  // @ts-ignore
                  fieldState: {},
                  // @ts-ignore
                  formState: {},
                  skeleton: true,
                })}
              </Skeleton>
            )
      }
    />
  ) : !formFetcherContext ||
    formFetcherContext.fetchedEntity ||
    !(skeleton ?? true) ? (
    render({
      // @ts-ignore
      fieldState: {},
      // @ts-ignore
      formState: {},
      // @ts-ignore
      field: {
        name,
        value,
        onChange: () => {},
        onBlur: () => {},
      },
    })
  ) : (
    <Skeleton>
      {render({
        // @ts-ignore
        field: { value: null },
        // @ts-ignore
        fieldState: {},
        // @ts-ignore
        formState: {},
        skeleton: true,
      })}
    </Skeleton>
  );

  if (!(grid ?? true)) {
    return content;
  }

  return (
    <Grid
      xs={xs ?? 12}
      sm={sm}
      md={md}
      lg={lg}
      xl={xl}
      sx={{ display: 'flex', alignItems: 'center' }}
    >
      {content}
    </Grid>
  );
}
