/* CONTEXTS */
// shared
export {
  DefaultConfiguration,
  ConfigurationProvider,
  ConfigurationContext,
  type ConfigurationType,
} from './contexts/ConfigurationContext';
export {
  NotificationsContext,
  NotificationsContextProvider,
  type NotificationsContextType,
} from './contexts/NotificationsContext';
// form
export {
  FormConfigContext,
  FormConfigProvider,
  type FormConfigContextType,
} from './form/contexts/FormConfigContext';
export {
  FormFetcher,
  FormFetcherContext,
  type FormFetcherContextType,
  type FormFetcherField,
  type FormFetcherHasuraFieldResolver,
  type FormFetcherHasuraLocalFieldResolver,
  type FormFetcherHasuraRemoteFieldResolver,
  type FormFetcherProps,
} from './form/contexts/FormFetcherContext';
export {
  FormSubmitter,
  FormSubmitterContext,
  type FormSubmitterContextType,
  type FormHasuraSubmitterProps,
  type FormRestSubmitterProps,
  type FormSubmitterDefaultValueResolver,
  type FormSubmitterField,
  type FormSubmitterHasuraManyToManyValueResolver,
  type FormSubmitterProps,
  type FormSubmitterValueResolver,
} from './form/contexts/FormSubmitterContext';
export {
  FormTabContext,
  type FormTabContextType,
} from './form/contexts/FormTabContext';
export {
  FormTabsContext,
  type FormTabsContextType,
} from './form/contexts/FormTabsContext';
export {
  LanguagesContext,
  type LanguagesContextType,
} from './form/contexts/LanguagesContext';
// shared
export {
  NavigationContext,
  NavigationContextProvider,
  type NavigationContextType,
} from './shared/contexts/NavigationContext';

/* COMPONENTS */
// form
export {
  BaseAutocompleteInput,
  type BaseAutocompleteInputProps,
} from './form/core/BaseAutocompleteInput';
export { BaseInput, type BaseInputProps } from './form/core/BaseInput';
export {
  BaseTextField,
  type BaseTextFieldProps,
} from './form/core/BaseTextField';
export { DirtyStateListener } from './form/core/DirtyStateListener';
export { FormErrorsListener } from './form/core/FormErrorsListener';
export { FormGetter } from './form/core/FormGetter';
export { FormSetter } from './form/core/FormSetter';
export { FormTab } from './form/core/FormTab';
export { FormTabs } from './form/core/FormTabs';
export { Grid } from './form/core/Grid';
export {
  HasuraAutocompleteInput,
  type HasuraAutocompleteInputProps,
  type HasuraAutocompleteRef,
} from './form/core/HasuraAutocompleteInput';
export {
  HasuraSelector,
  type HasuraSelectorRef,
} from './form/core/HasuraSelector';
export { InputClearButton } from './form/core/InputClearButton';
export { MaskedInput } from './form/core/MaskedInput';
export {
  InternalNumberInput,
  type InternalNumberInputProps,
} from './form/core/NumberInput';
export {
  PhoneInput,
  type InternalPhoneInputProps,
} from './form/core/PhoneInput';
export { SubmitButton } from './form/core/SubmitButton';
export {
  AttachmentsZone,
  type AttachmentsZoneProps,
} from './form/inputs/AttachmentsZone';
export {
  AutocompleteInput,
  type AutocompleteInputProps,
} from './form/inputs/AutocompleteInput';
export {
  CheckboxInput,
  type CheckboxInputProps,
} from './form/inputs/CheckboxInput';
export { ChipsInput, type ChipsInputProps } from './form/inputs/ChipsInput';
export { ConditionalInput } from './form/inputs/ConditionalInput';
export { DateInput, type DateInputProps } from './form/inputs/DateInput';
export { FormInput, type FormInputProps } from './form/inputs/FormInput';
export {
  TranslationInput,
  type TranslationInputProps,
} from './form/inputs/TranslationInput';
export { HiddenInput } from './form/inputs/HiddenInput';
export {
  RadioGroupInput,
  type RadioGroupInputProps,
} from './form/inputs/RadioGroupInput';
export { ColorInput, type ColorInputProps } from './form/inputs/ColorInput';
export {
  SelectInput,
  type SelectInputProps,
  type SelectMenuItemType,
} from './form/inputs/SelectInput';
export { TimeInput, type TimeInputProps } from './form/inputs/TimeInput';
export { FileInput, type FileInputProps } from './form/inputs/FileInput';
export {
  VerificationCodeInput,
  type VerificationCodeInputProps,
} from './form/inputs/VerificationCodeInput';
export { default as Form, type FormProps } from './form/Form';
export { type FormElementRef } from './form/Form.types';
// table
export {
  AddCustomFilterButton,
  type AddCustomFilterButtonProps,
} from './table/core/AddCustomFilterButton';
export {
  BaseDataTable,
  type BaseDataTableBaseColumnDef,
  type BaseDataTableColumnDef,
  type BaseDataTableEditColumnDef,
  type BaseDataTableProps,
  type BaseDataInnerState,
  type BaseDataTableDeleteColumnDef,
  type BaseDataTableIconButtonColumnDef,
  type BaseDataTableRef,
  type BaseDataTableRelationshipColumnDef,
  type BaseDataTableSelectColumnDef,
  type BaseDataTableSortColumnDef,
  type BaseDataTableState,
  type BaseDataTableTitle,
  type BaseTableEvents,
  type BaseTablePersistence,
} from './table/core/BaseDataTable';
export {
  ConfirmDialog,
  type ConfirmDialogElementRef,
  type ShowAlertProps,
} from './table/core/ConfirmDialog';
export { DeleteRowColumn } from './table/core/DeleteRowColumn';
export { EditRowColumn } from './table/core/EditRowColumn';
export { EmailColumn } from './table/core/EmailColumn';
export {
  HasuraDataTable,
  type HasuraDataTableColumnDef,
  type HasuraDataTableCustomFilter,
  type HasuraDataTableProps,
  type HasuraDataTableSearchFilter,
  type HasuraDataTableTabFilter,
  type HasuraDeleteProps,
} from './table/core/HasuraDataTable';
export { IconButtonColumn } from './table/core/IconButtonColumn';
export { NoRowsOverlay } from './table/core/NoRowsOverlay';
export { PhoneColumn } from './table/core/PhoneColumn';
export {
  PromptDialog,
  type PromptDialogElementRef,
  type PromptDialogProps,
} from './table/core/PromptDialog';
export {
  RowsCustomFilterForm,
  type RowsCustomFilterDef,
  type RowsCustomFilterFormProps,
  type RowsCustomFilterInput,
} from './table/core/RowsCustomFilterForm';
export {
  RowsFilter,
  type RowsFilterProps,
  type RowsFilterState,
} from './table/core/RowsFilter';
export {
  RowsSearchFilter,
  type RowsSearchFilterProps,
} from './table/core/RowsSearchFilter';
export {
  RowsTabsFilter,
  type DataTableTabFilter,
  type RowsTabsFilterProps,
} from './table/core/RowsTabsFilter';
export { SortColumn } from './table/core/SortColumn';
export { default as DataTable } from './table/DataTable';
export type { DataTableProps, DataTableRef } from './table/DataTable.types';
// shared
export { AbsoluteBox } from './shared/components/AbsoluteBox';
export {
  FormDialog,
  type FormDialogProps,
} from './shared/components/FormDialog';
export { LinkBehavior } from './shared/components/LinkBehavior';
export { OpenInNewInputAdorement } from './shared/components/OpenInNewInputAdorement';
export {
  DataTableEx,
  type DataTableExProps,
  type DataTableExRef,
} from './shared/components/DataTableEx';

/* LAYOUTS */
// shared
export {
  BasePageLayout,
  type BasePageLayoutProps,
} from './shared/layouts/BasePageLayout';
export {
  FormBreadcrumbs,
  FormPageLayout,
  type BreadcrumbsItem,
  type BreadcrumbsSelector,
  type FormBreadcrumbsProps,
  type FormPageLayoutProps,
} from './shared/layouts/FormPageLayout';
export {
  TablePageLayout,
  type TablePageLayoutProps,
} from './shared/layouts/TablePageLayout';

/* HOOKS */
// shared
export {
  useNavigate,
  isNavigationAllowed,
  type PreventNavigationOptions,
} from './shared/hooks/useNavigate';

/* UTILS */
// shared
export { buildHasuraQuery, type HasuraQuery } from './utils/buildHasuraQuery';
export { getGraphqlPath } from './utils/getGraphqlPath';
export { colorToHex } from './utils/colorToHex';
export { ControlledPromise } from './utils/promise/control';
export { PromiseUtils } from './utils/promise/utils';
export { MathUtils } from './utils/math';
// form
export {
  parseFormStateFromQuery,
  updateFormStateInQuery,
} from './form/utils/formPersistenceUtils';
export {
  parseFormTabsStateFromQuery,
  updateFormTabsStateInQuery,
} from './form/utils/formTabsPersistenceUtils';
export { getFileIcon } from './form/utils/getFileIcon';
// table
export { formatPhone } from './table/utils/formatPhone';
export {
  parseTableStateFromQuery,
  updateTableStateInQuery,
} from './table/utils/tablePersistenceUtils';

/* OTHER */
export type PromiseOrValue<T> = Promise<T> | T;
export type { HasuraOrderBy, HasuraSelectProps } from './table/DataTable.types';
