import { forwardRef, useContext } from 'react';
import {
  LinkProps as RouterLinkProps,
  NavLink,
  useLinkClickHandler,
} from 'react-router-dom';

import { NavigationContext } from 'shared/contexts/NavigationContext';

export default forwardRef<
  HTMLAnchorElement,
  Omit<RouterLinkProps, 'to'> & { href: RouterLinkProps['to'] }
>((props, ref) => {
  const { href, ...other } = props;
  const { isNavigationAllowed } = useContext(NavigationContext)!;

  const handleClick = useLinkClickHandler(href, {
    replace: props.replace,
    state: props.state,
    target: props.target,
  });

  return (
    <NavLink
      ref={ref}
      to={href}
      onClick={async (event) => {
        const openInNewTab = event.shiftKey || event.ctrlKey || event.metaKey;
        if (openInNewTab) {
          handleClick(event);
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        const isAllowed = await isNavigationAllowed();

        if (!isAllowed) {
          return;
        }

        handleClick(event);
      }}
      {...other}
    />
  );
});
