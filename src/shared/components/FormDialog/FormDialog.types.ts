import { DialogProps } from '@mui/material';
import type { Omit } from 'type-zoo/types';

import Form from 'form/Form';
import { FormElementRef } from 'form/Form.types';
import { FormFetcher } from 'form/contexts/FormFetcherContext';
import { FormSubmitter } from 'form/contexts/FormSubmitterContext';

type FormFetcherProps = React.ComponentProps<typeof FormFetcher>;
type FormSubmitterProps = React.ComponentProps<typeof FormSubmitter>;
type FormProps = React.ComponentProps<typeof Form>;

export type FormDialogProps = Omit<DialogProps, 'title' | 'onClose'> & {
  source: string;
  entityId?: FormFetcherProps['entityId'];
  formFetcherProps?: Omit<FormFetcherProps, 'children' | 'source'> & {
    source?: string;
  };
  formSubmitterProps?: Partial<FormSubmitterProps>;
  onClose: () => void;
  title?: React.ReactNode;
  formProps?: FormProps;
  autoFocus?: boolean;
  children: React.ReactNode;
  onSubmit?: (item: any) => void;
  components?: {
    beforeForm?: React.ReactNode;
    ActionButtons?:
      | React.ReactNode
      | ((props: {
          handleClose: () => void;
          cancelButton: React.ReactNode;
          cancelButtonText: string;
          submitButton: React.ReactNode;
          submitButtonText: string;
          formRef: React.RefObject<FormElementRef>;
          entityId: FormFetcherProps['entityId'];
        }) => React.ReactNode);
    afterForm?: React.ReactNode;
  };
  dismissable?: boolean;
};
