import { IconButton, Tooltip } from '@mui/material';
import { FilterVariantPlus } from 'mdi-material-ui';
import { useContext, useRef, useState } from 'react';

import { AddCustomFilterButtonProps } from './AddCustomFilterButton.types';
import AddCustomFilterMenu from './AddCustomFilterMenu';
import { ConfigurationContext } from '../../../contexts/ConfigurationContext';

export default function AddCustomFilterButton({
  filters,
  onSelect,
  buttonProps,
}: AddCustomFilterButtonProps) {
  const { translations } = useContext(ConfigurationContext);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  return (
    <>
      <Tooltip title={translations.tableAddFilterTooltip}>
        <IconButton
          {...buttonProps}
          size="large"
          ref={buttonRef}
          onClick={(event) => {
            setAnchorEl(buttonRef.current);

            if (buttonProps?.onClick) {
              buttonProps.onClick(event);
            }
          }}
        >
          <FilterVariantPlus />
        </IconButton>
      </Tooltip>
      <AddCustomFilterMenu
        anchorEl={anchorEl}
        filters={filters}
        onSelect={(filter) => {
          onSelect(filter);
          setAnchorEl(null);
        }}
        onClose={() => setAnchorEl(null)}
      />
    </>
  );
}
