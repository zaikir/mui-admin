import { OptionsObject, useSnackbar } from "notistack";
import { createContext, useCallback, useMemo, useRef } from "react";

import {
  ConfirmDialog,
  ConfirmDialogElementRef,
  ShowAlertProps,
} from "table/core/ConfirmDialog";
import {
  PromptDialog,
  PromptDialogElementRef,
  PromptDialogProps,
} from "table/core/PromptDialog";

import type { ConfigurationType } from "./ConfigurationContext";

export type NotificationsContextType = {
  showAlert: (
    message: string,
    variant?: string,
    options?: OptionsObject
  ) => void;
  showConfirm: (props: ShowAlertProps) => Promise<boolean>;
  showPrompt: (
    props: PromptDialogProps
  ) => Promise<false | Record<string, any>>;
};

export const NotificationsContext = createContext<NotificationsContextType>(
  {} as any
);

type Props = {
  config: ConfigurationType;
  children: React.ReactNode;
};

export function NotificationsContextProvider({ children, config }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const confirmDialogRef = useRef<ConfirmDialogElementRef>(null);
  const promptDialogRef = useRef<PromptDialogElementRef>(null);

  const showAlert = useCallback(
    (message: string, variant?: string, options?: OptionsObject) => {
      const snackbarOptions = (() => {
        if (options) {
          return options;
        }

        const actualVariant = variant ?? "default";
        return config.alerts.variants[actualVariant]
          ? config.alerts.variants[actualVariant]
          : { variant: actualVariant };
      })();

      enqueueSnackbar(message, snackbarOptions as any);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enqueueSnackbar]
  );

  const showConfirm = useCallback(
    (props: ShowAlertProps) => confirmDialogRef.current!.show(props),
    []
  );

  const showPrompt = useCallback(
    (props: PromptDialogProps) => promptDialogRef.current!.show(props),
    []
  );

  const contextData = useMemo(
    () => ({
      showConfirm,
      showPrompt,
      showAlert,
    }),
    [showConfirm, showPrompt, showAlert]
  );

  return (
    <NotificationsContext.Provider value={contextData}>
      {children}
      <ConfirmDialog ref={confirmDialogRef} />
      <PromptDialog ref={promptDialogRef} configuration={config} />
    </NotificationsContext.Provider>
  );
}
