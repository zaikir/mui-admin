import { useContext, useEffect } from 'react';
import {
  NavigateOptions,
  To,
  useNavigate as useNavigateBase,
} from 'react-router-dom';

import { NotificationsContext } from 'contexts/NotificationsContext';
import { NavigationContext } from 'shared/contexts/NavigationContext';
import { type ShowAlertProps } from 'table/core/ConfirmDialog';

export type PreventNavigationOptions = {
  preventNavigation?: () => boolean;
  confirm?: ShowAlertProps;
};

interface NavigateFunction {
  (to: To, options?: NavigateOptions): void;
  (delta: number): void;
}

export async function isNavigationAllowed(
  confirm: any,
  options?: PreventNavigationOptions,
) {
  const isEnabled = options?.preventNavigation!();
  if (!isEnabled) {
    return true;
  }

  const isAllowed = await confirm({
    ...options?.confirm,
    title: options?.confirm?.title ?? 'Изменения не сохранены!',
    text:
      options?.confirm?.text ??
      'При выходе вы потеряете все несохраненные данные.',
    accept: options?.confirm?.accept ?? 'Перейти',
    cancel: options?.confirm?.cancel ?? 'Отмена',
  });

  return isAllowed;
}

let listeners: any[] = [];

export function useNavigate(options?: PreventNavigationOptions) {
  const baseNavigate = useNavigateBase();
  const { showConfirm } = useContext(NotificationsContext)!;
  const navigationContext = useContext(NavigationContext)!;
  const preventOptions = navigationContext?.prevent || options;

  const navigate = async (...args: any[]) => {
    if (preventOptions?.preventNavigation) {
      const allowExit = await isNavigationAllowed(showConfirm, preventOptions);

      if (!allowExit) {
        return;
      }
    }

    // @ts-ignore
    baseNavigate(...args);
  };

  useEffect(() => {
    if (!preventOptions?.preventNavigation) {
      return;
    }

    const onConfirmRefresh = (event: any) => {
      const isDirty = preventOptions!.preventNavigation!();
      if (!isDirty) {
        return;
      }

      event.preventDefault();
      // eslint-disable-next-line no-return-assign, no-param-reassign
      return (event.returnValue = 'Are you sure you want to leave the page?');
    };

    listeners.push(onConfirmRefresh);

    window.addEventListener('beforeunload', onConfirmRefresh);
    return () => {
      listeners.forEach((x) => {
        window.removeEventListener('beforeunload', x);
      });

      listeners = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preventOptions]);

  return navigate as NavigateFunction;
}
