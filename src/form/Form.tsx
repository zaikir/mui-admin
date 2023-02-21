import {
  Box,
  createTheme,
  SxProps,
  ThemeProvider,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {
  useEffect,
  FormHTMLAttributes,
  PropsWithChildren,
  useContext,
  forwardRef,
  Ref,
  useImperativeHandle,
  useRef,
  SetStateAction,
  Dispatch,
} from 'react';
import { Control, FormProvider, useForm, UseFormProps } from 'react-hook-form';
import { FieldValues } from 'react-hook-form/dist/types/fields';

import { FormElementRef } from './Form.types';
import { FormConfigProvider } from './contexts/FormConfigContext/FormConfigContext';
// eslint-disable-next-line import/no-cycle
import { FormFetcherContext } from './contexts/FormFetcherContext/FormFetcherContext';
import { FormSubmitterContext } from './contexts/FormSubmitterContext';
import { DirtyStateListener } from './core/DirtyStateListener';
import { FormGetter } from './core/FormGetter';
import {
  parseFormStateFromQuery,
  updateFormStateInQuery,
} from './utils/formPersistenceUtils';
import { PromiseOrValue } from '../index';

export type FormProps<TFields extends FieldValues> = PropsWithChildren<
  UseFormProps<TFields> & {
    grid?: boolean;
    spacing?: number;
    formProps?: FormHTMLAttributes<HTMLFormElement>;
    containerProps?: Omit<React.ComponentProps<typeof Grid>, 'children'>;
    sx?: SxProps;
    dense?: boolean;
    readOnly?: boolean;
    dirtySubmit?: boolean;
    persistStateMode?: { type: 'query'; queryPrefix?: string; json?: boolean };
    setControl?: Dispatch<SetStateAction<Control<TFields, any>>>;
    onSubmit?: (
      item: any,
      context: { ref: FormElementRef },
    ) => PromiseOrValue<void>;
  }
>;

const Form = forwardRef(
  (
    {
      children,
      formProps,
      spacing = 2,
      sx,
      containerProps,
      dense,
      readOnly,
      grid,
      dirtySubmit,
      defaultValues,
      persistStateMode,
      onSubmit,
      setControl,
      ...useFormProps
    }: PropsWithChildren<FormProps<any>>,
    ref: Ref<FormElementRef>,
  ) => {
    const fetcherState = useContext(FormFetcherContext);
    const submitterState = useContext(FormSubmitterContext);
    const submitButtonRef = useRef<HTMLButtonElement>(null);
    const submitPromiseResolverRef = useRef<(value: unknown) => void>();
    const isFormDirtyRef = useRef(false);
    const forceSubmit = useRef(false);

    const restoredDefaultValues = (() => {
      if (persistStateMode?.type === 'query') {
        const restored = parseFormStateFromQuery(
          persistStateMode?.queryPrefix,
          persistStateMode.json,
        );

        return {
          ...defaultValues,
          ...restored,
        };
      }

      return defaultValues;
    })() as string;

    const methods = useForm({
      shouldUnregister: true,
      defaultValues: restoredDefaultValues,
      ...useFormProps,
    });

    const oldTheme = useTheme();
    const theme = createTheme({
      ...oldTheme,
      components: {
        ...oldTheme.components,
        MuiFormHelperText: {
          ...oldTheme.components?.MuiFormHelperText,
          styleOverrides: {
            ...oldTheme.components?.MuiFormHelperText?.styleOverrides,
            root: {
              marginTop: '-1px',
              height: '1px',
              textAlign: 'right',
              fontSize: 11,
              // eslint-disable-next-line max-len
              ...(oldTheme.components?.MuiFormHelperText?.styleOverrides
                ?.root as Record<string, unknown>),
            },
          },
        },
      },
    });

    useEffect(() => {
      if (!fetcherState?.fetchedEntity) {
        return;
      }

      methods.reset({
        ...(fetcherState.fetchedEntity as any),
        // eslint-disable-next-line no-underscore-dangle
        ...(fetcherState.fetchedEntity._new && {
          ...methods.formState.defaultValues,
        }),
      });
      isFormDirtyRef.current = false;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetcherState]);

    useImperativeHandle(
      ref,
      () => ({
        getControl() {
          return methods.control;
        },
        async submit(force?: boolean) {
          submitButtonRef.current?.click();
          forceSubmit.current = force ?? false;
          await new Promise((resolve) => {
            submitPromiseResolverRef.current = resolve;
          });
        },
        async reset(values?: any) {
          methods.reset(values);
          isFormDirtyRef.current = false;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }),
      [],
    );

    useEffect(() => {
      if (
        !methods.formState.isSubmitting &&
        submitPromiseResolverRef?.current
      ) {
        submitPromiseResolverRef?.current(true);
      }
    }, [methods.formState.isSubmitting]);

    useEffect(() => {
      if (setControl) {
        setControl(methods.control);
      }
    }, [setControl, methods]);

    return (
      <ThemeProvider theme={theme}>
        <FormConfigProvider dense={dense} readOnly={readOnly} spacing={spacing}>
          <FormProvider {...methods}>
            {persistStateMode && (
              <FormGetter
                onChange={(values) => {
                  if (persistStateMode.type === 'query') {
                    updateFormStateInQuery(
                      values,
                      persistStateMode.queryPrefix,
                      persistStateMode.json,
                    );
                  }
                }}
              />
            )}
            <DirtyStateListener
              onChange={(x) => {
                isFormDirtyRef.current = x;
              }}
            />
            <Box
              component="form"
              onSubmit={(event) => {
                if (event) {
                  if (typeof event.preventDefault === 'function') {
                    event.preventDefault();
                  }
                  if (typeof event.stopPropagation === 'function') {
                    event.stopPropagation();
                  }
                }

                if (
                  !forceSubmit.current &&
                  (methods.formState.isSubmitting ||
                    ((dirtySubmit ?? true) && !isFormDirtyRef.current))
                ) {
                  return;
                }

                forceSubmit.current = false;
                const handler = submitterState?.onSubmit || onSubmit;
                if (handler) {
                  methods.handleSubmit((row) =>
                    handler(row, {
                      // @ts-ignore
                      ref: {
                        async reset(values?: any) {
                          methods.reset(values);
                          isFormDirtyRef.current = false;
                        },
                      },
                    }),
                  )(event);
                }
              }}
              noValidate
              sx={{ ...sx }}
              {...formProps}
            >
              <button
                ref={submitButtonRef}
                type="submit"
                style={{ display: 'none' }}
              >
                submit
              </button>
              {grid ?? true ? (
                <Grid container spacing={spacing} {...containerProps}>
                  {children}
                </Grid>
              ) : (
                children
              )}
            </Box>
          </FormProvider>
        </FormConfigProvider>
      </ThemeProvider>
    );
  },
);

export default Form;
