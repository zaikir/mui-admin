import {
  Box,
  Breadcrumbs,
  IconButton,
  Link,
  Skeleton,
  Typography,
} from '@mui/material';
import { KeyboardBackspace } from 'mdi-material-ui';
import { useContext } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useLocation } from 'react-router-dom';

import { ConfigurationContext } from 'contexts/ConfigurationContext';
import { NotificationsContext } from 'contexts/NotificationsContext';
import { FormFetcherContext } from 'form/contexts/FormFetcherContext';
import { useNavigate } from 'shared/hooks/useNavigate';

import { FormBreadcrumbsProps } from './FormBreadcrumbs.types';

export function FormBreadcrumbs({
  breadcrumbs,
  defaultRoute,
  deps,
}: FormBreadcrumbsProps) {
  const { control: formControl } = useFormContext();
  const { translations } = useContext(ConfigurationContext);
  const { showAlert } = useContext(NotificationsContext)!;
  const { fetchedEntity: entity } = useContext(FormFetcherContext)!;

  const formEntity = useWatch({
    control: formControl,
    ...(deps && { names: deps as any }),
  });
  const navigate = useNavigate();
  const { key: locationKey } = useLocation();

  const handleGoBack = () => {
    if (!defaultRoute) {
      return;
    }

    if (locationKey === 'default') {
      navigate(defaultRoute);
      return;
    }

    navigate(-1);
  };

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', height: '41px' }}>
      {defaultRoute && (
        <IconButton sx={{ mr: 1 }} size="small" onClick={handleGoBack}>
          <KeyboardBackspace />
        </IconButton>
      )}

      <Breadcrumbs sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
        {breadcrumbs.map((breadcrumb, breadcrumbIdx) => {
          const isLoading = typeof breadcrumb === 'function' && !entity;
          if (isLoading) {
            // eslint-disable-next-line react/no-array-index-key
            return <Skeleton key={breadcrumbIdx} width={150} />;
          }

          const data =
            typeof breadcrumb === 'object'
              ? breadcrumb
              : breadcrumb({ ...entity, ...formEntity });
          if (data.element) {
            return data.element;
          }

          const content = (
            <>
              {data.icon && (
                // @ts-ignore
                <data.icon sx={{ mr: 1 }} fontSize="inherit" />
              )}
              {data.text}
            </>
          );

          return !data.href ? (
            <Typography
              // eslint-disable-next-line react/no-array-index-key
              key={breadcrumbIdx}
              color="text.primary"
              {...((data.onClick || data.copyOnClick) && {
                onClick:
                  data.onClick ??
                  (() => {
                    if (data.copyOnClick) {
                      navigator.clipboard.writeText(data.text);
                      showAlert(translations.copied);
                    }
                  }),
                sx: {
                  fontSize: { xs: '0.8rem', md: '1rem' },
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                },
              })}
            >
              {content}
            </Typography>
          ) : (
            <Link
              // eslint-disable-next-line react/no-array-index-key
              key={breadcrumbIdx}
              underline="hover"
              color="inherit"
              href={data.href}
              sx={{
                display: 'flex',
                alignItems: 'center',
                fontSize: { xs: '0.8rem', md: '1rem' },
              }}
            >
              {content}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}
