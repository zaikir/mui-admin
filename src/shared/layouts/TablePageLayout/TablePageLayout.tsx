import { TablePageLayoutProps } from './TablePageLayout.types';
import { BasePageLayout } from '../BasePageLayout';

export default function TablePageLayout({ ...rest }: TablePageLayoutProps) {
  return (
    <BasePageLayout
      {...rest}
      paperProps={{
        sx: [
          {
            pt: 1,
            px: 2,
            '& .MuiDataGrid-root': {
              mx: -2,
              borderColor: 'transparent',
            },
            ...((typeof rest?.paperProps?.sx === 'object' &&
              rest?.paperProps?.sx) as any),
          },
        ],
      }}
    />
  );
}
