import {
  Box,
  Paper,
  Portal,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useContext } from 'react';

import { NavigationContext } from 'shared/contexts/NavigationContext';

import { BasePageLayoutProps } from './BasePageLayout.types';

export default function BasePageLayout({
  title,
  actionContent,
  children,
  paperProps,
}: BasePageLayoutProps) {
  const { navbarContainer } = useContext(NavigationContext);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
      }}
    >
      <Portal container={navbarContainer} disablePortal={isSmallScreen}>
        {title && (
          <Box
            sx={{
              mb: { xs: 2, md: 0 },
              display: 'flex',
              alignItems: 'center',
              flexGrow: { xs: 0, md: 1 },
            }}
          >
            {typeof title === 'string' ? (
              <Typography variant="h4">{title}</Typography>
            ) : (
              title
            )}
            {actionContent}
          </Box>
        )}
      </Portal>
      <Paper
        {...paperProps}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 500,
          ...paperProps?.sx,
        }}
      >
        {children}
      </Paper>
    </Box>
  );
}
