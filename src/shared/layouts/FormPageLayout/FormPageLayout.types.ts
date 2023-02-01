import type { Omit } from 'type-zoo/types';

import Form from 'form/Form';
import { FormFetcher } from 'form/contexts/FormFetcherContext';
import { FormSubmitter } from 'form/contexts/FormSubmitterContext';

import { FormBreadcrumbsProps } from './FormBreadcrumbs.types';
import { BasePageLayoutProps } from '../BasePageLayout/BasePageLayout.types';

type FormProps = React.ComponentProps<typeof Form>;
type FormFetcherProps = React.ComponentProps<typeof FormFetcher>;
type FormSubmitterProps = React.ComponentProps<typeof FormSubmitter>;

export type FormPageLayoutProps = Omit<BasePageLayoutProps, 'title'> & {
  source: string;
  readOnly?: boolean;
  getEntityId?: (params: Record<string, string>) => string | number;
  children?: React.ReactNode;
  tagsSlot?: React.ReactNode;
  formProps?: Partial<FormProps>;
  formFetcherProps?: Partial<FormFetcherProps>;
  formSubmitterProps?: Partial<FormSubmitterProps>;
  breadcrumbs: FormBreadcrumbsProps['breadcrumbs'];
  defaultRoute?: FormBreadcrumbsProps['defaultRoute'];
  breadcrumbsDeps?: FormBreadcrumbsProps['deps'];
  hideSaveButton?: boolean;
  allowUnsavedExit?: boolean;
};
