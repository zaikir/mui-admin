import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { Children, useContext, useRef } from 'react';

import { ConfigurationContext } from 'contexts/ConfigurationContext';
import Form from 'form/Form';
import { FormElementRef } from 'form/Form.types';
import { FormFetcher } from 'form/contexts/FormFetcherContext';
import { FormSubmitter } from 'form/contexts/FormSubmitterContext';
import { DirtyStateListener } from 'form/core/DirtyStateListener';
import { SubmitButton } from 'form/core/SubmitButton';

import { FormDialogProps } from './FormDialog.types';

export default function FormDialog({
  open,
  title,
  onClose,
  children,
  formProps,
  source,
  formFetcherProps,
  formSubmitterProps,
  entityId,
  autoFocus,
  onSubmit,
  components,
  ...rest
}: FormDialogProps) {
  const { translations } = useContext(ConfigurationContext);
  const formRef = useRef<FormElementRef>(null);
  const isFormDirtyRef = useRef(false);

  const handleClose = () => {
    onClose();
  };

  const content =
    entityId || !(autoFocus ?? true)
      ? children
      : Children.map(children, (child, idx) =>
          idx === 0
            ? // @ts-ignore
              React.cloneElement(child, { autoFocus: true })
            : child,
        );

  return (
    <Dialog
      {...rest}
      open={open}
      maxWidth={rest.maxWidth ?? 'md'}
      fullWidth={rest.fullWidth ?? true}
      onClose={() => {
        if (isFormDirtyRef.current) {
          return;
        }

        handleClose();
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        {title}
        <IconButton onClick={() => handleClose()} sx={{ ml: 'auto', mr: -1 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <FormSubmitter
          // @ts-ignore
          source={
            (formSubmitterProps?.mode === 'hasura' &&
              formSubmitterProps?.source) ||
            source
          }
          {...(formSubmitterProps as any)}
          entityId={entityId}
          resetAfterSubmit={false}
          onSubmit={(data) => {
            handleClose();

            if (onSubmit) {
              onSubmit(data);
            }

            if (formSubmitterProps?.onSubmit) {
              formSubmitterProps?.onSubmit(data);
            }
          }}
          // @ts-ignore
          selection={formSubmitterProps?.selection ?? ['id']}
        >
          <FormFetcher
            source={(formFetcherProps?.source ?? source) as string}
            entityId={entityId}
            {...formFetcherProps}
          >
            <Form ref={formRef} {...formProps} dirtySubmit={false}>
              {content}
              <DirtyStateListener
                onChange={(isDirty) => {
                  isFormDirtyRef.current = isDirty;
                }}
              />
            </Form>
          </FormFetcher>
        </FormSubmitter>
      </DialogContent>
      <DialogActions>
        {components?.ActionButtons || (
          <>
            <Button variant="text" onClick={() => handleClose()}>
              {translations.cancel}
            </Button>
            <SubmitButton variant="text" formRef={formRef}>
              {entityId ? translations.save : translations.create}
            </SubmitButton>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
