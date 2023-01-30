/* eslint-disable react-hooks/rules-of-hooks */
import { LoadingButton as LoadingButtonBase } from "@mui/lab";
import { IconButton } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { FormElementRef } from "packages/mui-admin";
import { RefObject, useEffect, useState } from "react";
import { useFormContext, useFormState } from "react-hook-form";
import type { Omit } from "type-zoo/types";

import type { InputGridProps } from "../BaseInput";
import { DirtyStateListener } from "../DirtyStateListener";

type LoadingButtonBaseProps = React.ComponentProps<typeof LoadingButtonBase>;
type IconButtonProps = React.ComponentProps<typeof IconButton>;
type LoadingButtonProps =
  | ({ icon: true } & IconButtonProps)
  | ({ icon?: false } & LoadingButtonBaseProps);

function LoadingButton({
  icon,
  loading,
  ...rest
}: LoadingButtonProps & { loading: boolean }) {
  if (!icon) {
    return (
      <LoadingButtonBase
        loading={loading}
        {...(rest as LoadingButtonBaseProps)}
      />
    );
  }

  // @ts-ignore
  return (
    <IconButton
      disabled={loading}
      // @ts-ignore
      sx={{ ...rest.sx, ...(loading && { opacity: 0.5 }) }}
      {...(rest as IconButtonProps)}
    />
  );
}

export type SubmitButtonProps = Omit<LoadingButtonProps, "type"> &
  InputGridProps & {
    activateOnDirty?: boolean;
    formRef?: RefObject<FormElementRef>;
    grid?: boolean;
  };

function FormControlledSubmitButton({
  control,
  formRef,
  activateOnDirty,
  icon,
  ...rest
}: any) {
  const formState = useFormState({ control });
  const { isSubmitting } = formState;
  const [isDirty, setIsDirty] = useState(false);

  return (
    <>
      <DirtyStateListener control={control} onChange={setIsDirty} />
      <LoadingButton
        {...rest}
        loading={isSubmitting}
        disabled={rest.disabled || (activateOnDirty && !isDirty)}
        onClick={() => {
          if (rest.onClick) {
            rest.onClick();
          }

          if (formRef.current!.submit) {
            formRef.current!.submit();
          }
        }}
      />
    </>
  );
}

export default function SubmitButton({
  xs,
  sm,
  md,
  lg,
  xl,
  grid,
  children,
  formRef,
  activateOnDirty,
  ...rest
}: SubmitButtonProps) {
  if (!formRef) {
    const { formState } = useFormContext();
    const [isDirty, setIsDirty] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      if (!formState.isSubmitting) {
        setTimeout(() => {
          setIsSubmitting(false);
        }, 50);
        return;
      }

      setIsSubmitting(formState.isSubmitting);
    }, [formState.isSubmitting]);

    const content = (
      <>
        <LoadingButton
          {...(rest as any)}
          type="submit"
          disabled={rest.disabled || (activateOnDirty && !isDirty)}
          loading={isSubmitting || formState.isSubmitting}
        >
          {children}
        </LoadingButton>
        <DirtyStateListener onChange={setIsDirty} />
      </>
    );

    return !(grid ?? true) ? (
      content
    ) : (
      <Grid xs={xs ?? 12} sm={sm} md={md} lg={lg} xl={xl}>
        {content}
      </Grid>
    );
  }

  const [isFormInitialized, setIsFormInitialized] = useState(false);

  useEffect(() => {
    setIsFormInitialized(true);
  }, []);

  if (!isFormInitialized) {
    return null;
  }

  const control = formRef.current ? formRef.current.getControl() : undefined;

  return (
    <FormControlledSubmitButton
      control={control}
      formRef={formRef}
      activateOnDirty={activateOnDirty}
      {...rest}
    >
      {children}
    </FormControlledSubmitButton>
  );
}
