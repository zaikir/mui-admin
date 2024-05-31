import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
} from '@mui/material';
import { forwardRef, Ref, useImperativeHandle, useRef, useState } from 'react';
import type { Omit } from 'type-zoo/types';

import type { ConfigurationType } from 'contexts/ConfigurationContext';
import Form, { FormProps } from 'form/Form';
import {
  FormSubmitter,
  FormSubmitterProps,
} from 'form/contexts/FormSubmitterContext';

import { FormElementRef } from '../../../form/Form.types';
import { SubmitButton } from '../../../form/core/SubmitButton';

export type PromptDialogProps = {
  title: string;
  text?: string;
  form?: React.ReactNode;
  dialog?: (dialogProps: {
    onAccept: (item: any) => void;
    onClose: () => void;
  }) => React.ReactNode;
  cancel?: string | false;
  accept?: string;
  width?: number;
  formSubmitterProps?: FormSubmitterProps;
  dialogProps?: Omit<DialogProps, 'open'>;
  formProps?: FormProps<any>;
};

export type PromptDialogElementRef = {
  show: (props: PromptDialogProps) => Promise<false | Record<string, any>>;
};

type Props = {
  configuration: ConfigurationType;
};

const PromptDialog = forwardRef(
  (
    { configuration: { translations } }: Props,
    ref: Ref<PromptDialogElementRef>,
  ) => {
    const [isOpened, setIsOpened] = useState(false);
    const [title, setTitle] = useState('');
    const [text, setText] = useState<string>();
    const [formContent, setFormContent] = useState<React.ReactNode>();
    const [acceptButtonText, setAcceptButtonText] = useState<string>();
    const [cancelButtonText, setCancelButtonText] = useState<string | false>();
    const [allDialogProps, setAllDialogProps] = useState<PromptDialogProps>();

    const formRef = useRef<FormElementRef>(null);
    const resolvePromiseRef =
      useRef<(result: false | Record<string, any>) => void>();

    const handleClose = () => {
      setIsOpened(false);

      if (resolvePromiseRef.current) {
        resolvePromiseRef.current(false);
      }
    };

    const onAccept = (item: any) => {
      setIsOpened(false);

      if (resolvePromiseRef.current) {
        resolvePromiseRef.current(item);
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        async show(dialogProps) {
          setTitle(dialogProps.title);
          setText(dialogProps.text);
          setFormContent(dialogProps.form);
          setAcceptButtonText(dialogProps.accept ?? '');
          setCancelButtonText(dialogProps.cancel);
          setAllDialogProps(dialogProps);
          setIsOpened(true);

          return new Promise<false | Record<string, any>>((resolve) => {
            resolvePromiseRef.current = resolve;
          });
        },
      }),
      [],
    );

    if (allDialogProps?.dialog) {
      return (
        <>
          {allDialogProps?.dialog({
            onAccept,
            onClose: handleClose,
          })}
        </>
      );
    }

    return (
      <Dialog
        {...allDialogProps?.dialogProps}
        open={isOpened}
        maxWidth={allDialogProps?.dialogProps?.maxWidth ?? 'sm'}
        PaperProps={{
          sx: {
            minWidth: allDialogProps?.width ?? 350,
          },
        }}
      >
        <DialogTitle>{title}</DialogTitle>

        <DialogContent>
          {text && <DialogContentText>{text}</DialogContentText>}
          {allDialogProps?.formSubmitterProps ? (
            <FormSubmitter
              {...(allDialogProps?.formSubmitterProps as any)}
              onSubmit={async (item) => {
                if (allDialogProps?.formSubmitterProps?.onSubmit) {
                  await allDialogProps?.formSubmitterProps?.onSubmit(item);
                }

                onAccept(item);
              }}
            >
              <Form
                ref={formRef}
                dirtySubmit={false}
                {...allDialogProps.formProps}
              >
                {formContent}
              </Form>
            </FormSubmitter>
          ) : (
            <Form
              ref={formRef}
              dirtySubmit={false}
              onSubmit={onAccept}
              {...allDialogProps?.formProps}
            >
              {formContent}
            </Form>
          )}
        </DialogContent>

        <DialogActions>
          {cancelButtonText !== false && (
            <Button onClick={handleClose}>
              {cancelButtonText || translations.cancel}
            </Button>
          )}
          <SubmitButton formRef={formRef} grid={false}>
            {acceptButtonText}
          </SubmitButton>
        </DialogActions>
      </Dialog>
    );
  },
);

export default PromptDialog;
