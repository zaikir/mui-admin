import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { resolveNumberFormat } from '@sumup/intl';
import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { OptionsObject, SnackbarProvider } from 'notistack';
import { createContext } from 'react';

// eslint-disable-next-line import/no-cycle
import { CountryCode } from 'form/core/PhoneInput/phones';
import { ShowAlertProps } from 'table/core/ConfirmDialog';
import { buildHasuraQuery, HasuraQuery } from 'utils/buildHasuraQuery';

import { NotificationsContextProvider } from './NotificationsContext';

const { locale, groupDelimiter, decimalDelimiter } = resolveNumberFormat()!;

type SnackbarVariant =
  | 'default'
  | 'success'
  | 'info'
  | 'error'
  | 'warning'
  | string;
type SnackbarType = {
  text: string;
  variant: SnackbarVariant;
};

export type ConfigurationType = {
  translations: {
    valueRequired: string;
    wrongEmailFormat: string;
    wrongPhoneFormat: string;
    wrongDateFormat: string;
    nullSelectOptionText: string;
    autocompletePlaceholder: string;
    tableSearchPlaceholder: string;
    tableAddFilterTooltip: string;
    tableNoRows: string;
    unexpectedError: string;
    deleteTableRow: string;
    attachmentsZoneTitle: string;
    attachmentsZoneLabel: string;
    attachmentsZoneText?: string;
    attachmentsZoneAccept: string;
    attachmentsZoneCancel: string;
    attachmentsUploadedSuccessfully: string;
    attachmentsUploadedOrDropFileHere: string;
    attachmentsNoFiles: string;
    attachmentsFileMenuDownload: string;
    attachmentsFileMenuDelete: string;
    addNewAutocompleteValue: string;
    cancel: string;
    save: string;
    saveAndExit: string;
    create: string;
    open: string;
    addNew: string;
    copied: string;
    noFile: string;
    notSet: string;
    clear: string;
  };
  locale: string;
  defaultPhoneCountry: CountryCode;
  thousandsSeparator: string;
  decimalSeparator: string;
  defaultLocale: string;
  availableLocales: string[];
  onSearch: (value: string) => string[];
  defaultDeleteConfirm: ShowAlertProps;
  defaultDeleteFileConfirm: ShowAlertProps;
  hasura: {
    request: (
      query: HasuraQuery,
      options?: { showRemoved?: boolean },
    ) => Promise<any>;
    subscribe(request: HasuraQuery, onNext: (value: any) => void): () => void;
    primaryKey: string;
    filter: Record<string, any> | null;
    removedFilter: Record<string, any> | null;
    removeUpdate: Record<string, any>;
  };
  rest: {
    client: AxiosInstance;
  };
  alerts: {
    maxStackSize: number;
    variants: Record<SnackbarVariant, OptionsObject>;
    snackbars: {
      entityCreated: SnackbarType;
      entityUpdated: SnackbarType;
      entityDeleted: SnackbarType;
    };
  };
};

const defaultSnackbarOptions: OptionsObject = {
  disableWindowBlurListener: true,
  autoHideDuration: 1000,
  anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
};

export const DefaultConfiguration: ConfigurationType = {
  locale,
  translations: {
    valueRequired: 'Value required',
    wrongEmailFormat: 'Invalid email address',
    wrongPhoneFormat: 'Invalid phone format',
    wrongDateFormat: 'Invalid date format',
    nullSelectOptionText: 'None',
    autocompletePlaceholder: 'Type and press "Enter"',
    tableSearchPlaceholder: 'Search by name',
    tableAddFilterTooltip: 'Add filter',
    tableNoRows: 'No Rows',
    unexpectedError: 'Unexpected error occurred',
    deleteTableRow: 'Delete',
    attachmentsZoneTitle: 'Select attachment type',
    attachmentsZoneLabel: 'Type of the attachment',
    attachmentsZoneAccept: 'Upload',
    attachmentsZoneCancel: 'Cancel',
    attachmentsUploadedSuccessfully: 'Files uploaded',
    attachmentsUploadedOrDropFileHere: 'Upload or drop file here',
    attachmentsNoFiles: 'No files uploaded',
    attachmentsFileMenuDownload: 'Download',
    attachmentsFileMenuDelete: 'Delete',
    addNewAutocompleteValue: 'Add value',
    cancel: 'Cancel',
    save: 'Save',
    saveAndExit: 'Save and exit',
    create: 'Create',
    open: 'Open',
    addNew: 'Add new',
    copied: 'Copied',
    noFile: 'No file',
    notSet: 'Not set',
    clear: 'Clear',
  },
  defaultPhoneCountry: 'US',
  thousandsSeparator: groupDelimiter!,
  decimalSeparator: decimalDelimiter!,
  defaultLocale: 'en',
  availableLocales: ['en'],
  onSearch: (value) => [value.toLowerCase()],
  defaultDeleteConfirm: {
    title: 'Delete row?',
    accept: 'Delete',
    cancel: 'Cancel',
  },
  defaultDeleteFileConfirm: {
    title: 'Delete file?',
    accept: 'Delete',
    cancel: 'Cancel',
  },
  hasura: {
    async request(query) {
      const { extractResult, ...data } = buildHasuraQuery(query);
      const { data: response } = await axios.post('/v1/graphql', data);

      return extractResult ? extractResult(response.data) : response.data;
    },
    subscribe() {
      throw new Error('Subscriptions are not implemented');
    },
    primaryKey: 'id',
    filter: null, // { isRemoved: { _eq: false } },
    removedFilter: { isRemoved: { _eq: false } },
    removeUpdate: { isRemoved: true },
  },
  rest: {
    client: axios.create({ baseURL: '/api' }),
  },
  alerts: {
    maxStackSize: 3,
    variants: {
      success: { variant: 'success', ...defaultSnackbarOptions },
      info: { variant: 'info', ...defaultSnackbarOptions },
      default: { variant: 'default', ...defaultSnackbarOptions },
      error: { variant: 'error', ...defaultSnackbarOptions },
      warning: { variant: 'warning', ...defaultSnackbarOptions },
    },
    snackbars: {
      entityCreated: { text: 'Saved', variant: 'success' },
      entityUpdated: { text: 'Saved', variant: 'success' },
      entityDeleted: { text: 'Deleted', variant: 'success' },
    },
  },
};

export const ConfigurationContext =
  createContext<ConfigurationType>(DefaultConfiguration);

type Props = {
  children: React.ReactNode;
} & ConfigurationType;

export function ConfigurationProvider({ children, ...rest }: Props) {
  return (
    <SnackbarProvider maxSnack={rest.alerts?.maxStackSize ?? 3}>
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        adapterLocale={
          rest.availableLocales!.includes(locale) ? locale : rest.defaultLocale
        }
      >
        <ConfigurationContext.Provider value={rest}>
          <NotificationsContextProvider config={rest}>
            {children}
          </NotificationsContextProvider>
        </ConfigurationContext.Provider>
      </LocalizationProvider>
    </SnackbarProvider>
  );
}
