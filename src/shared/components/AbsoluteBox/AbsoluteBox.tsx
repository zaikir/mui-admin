import { Box, SxProps, Theme } from '@mui/material';
import type { Property } from 'csstype';
import * as React from 'react';

type Alignment =
  | 'left'
  | 'center'
  | 'right'
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

type Props = {
  align?: Alignment;
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
};

const Alignments: Record<
  Alignment,
  {
    justifyContent: Property.JustifyContent;
    alignItems: Property.AlignItems;
  }
> = {
  'top-left': { alignItems: 'flex-start', justifyContent: 'flex-start' },
  'top-center': { alignItems: 'flex-start', justifyContent: 'center' },
  'top-right': { alignItems: 'flex-start', justifyContent: 'flex-end' },

  left: { alignItems: 'center', justifyContent: 'flex-start' },
  center: { alignItems: 'center', justifyContent: 'center' },
  right: { alignItems: 'center', justifyContent: 'flex-end' },

  'bottom-left': { alignItems: 'flex-end', justifyContent: 'flex-start' },
  'bottom-center': { alignItems: 'flex-end', justifyContent: 'center' },
  'bottom-right': { alignItems: 'flex-end', justifyContent: 'flex-end' },
};

export default function AbsoluteBox({ children, align = 'center', sx }: Props) {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        ...Alignments[align],
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
