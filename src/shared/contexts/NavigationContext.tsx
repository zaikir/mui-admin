import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { ConfigurationContext } from 'contexts/ConfigurationContext';
import { NotificationsContext } from 'contexts/NotificationsContext';
import {
  isNavigationAllowed as isNavigationAllowedBase,
  type PreventNavigationOptions,
} from 'shared/hooks/useNavigate';

export type NavigationContextType = {
  prevent: PreventNavigationOptions | null;
  setPrevent: (options: PreventNavigationOptions | null) => void;
  isNavigationAllowed: () => Promise<boolean>;
  navbarContainer: HTMLDivElement | null;
  setNavbarContainer: (ref: HTMLDivElement) => void;
};

export const NavigationContext = createContext<NavigationContextType>(
  {} as any,
);

export function NavigationContextProvider(props: {
  children: React.ReactNode;
}) {
  const { children } = props;
  const [prevent, setPrevent] = useState<PreventNavigationOptions | null>(null);
  const [navbarContainer, setNavbarContainer] = useState<HTMLDivElement | null>(
    null,
  );
  const notificationsContext = useContext(NotificationsContext);
  const { translations } = useContext(ConfigurationContext);

  const isNavigationAllowed = useCallback(async () => {
    if (prevent && notificationsContext?.showConfirm) {
      const isAllowed = await isNavigationAllowedBase(
        notificationsContext?.showConfirm,
        translations,
        prevent,
      );

      return isAllowed;
    }

    return true;
  }, [notificationsContext?.showConfirm, translations, prevent]);

  const contextData = useMemo(
    () => ({
      prevent,
      setPrevent,
      isNavigationAllowed,
      navbarContainer,
      setNavbarContainer,
    }),
    [
      prevent,
      setPrevent,
      isNavigationAllowed,
      navbarContainer,
      setNavbarContainer,
    ],
  );

  return (
    <NavigationContext.Provider value={contextData}>
      {children}
    </NavigationContext.Provider>
  );
}
