import { Box, debounce, InputAdornment, TextField } from '@mui/material';
import { Magnify } from 'mdi-material-ui';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { ConfigurationContext } from 'contexts/ConfigurationContext';
import { InputClearButton } from 'form/core/InputClearButton';

import { RowsSearchFilterProps } from './RowsSearchFilter.types';

export default function RowsSearchFilter({
  value,
  onChange,
  containerStyle,
  inputProps,
  debounce: debounceTimeout,
  FiltersButton,
  slots,
}: RowsSearchFilterProps) {
  const { translations } = useContext(ConfigurationContext);
  const [search, setSearch] = useState(value);
  const isFirstRender = useRef(true);

  const debouncedSearch = useMemo(
    () =>
      debounce((val) => {
        onChange(val);
      }, debounceTimeout ?? 300),
    [debounceTimeout, onChange],
  );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    debouncedSearch(search);
  }, [search, debouncedSearch]);

  return (
    <Box
      sx={{
        pb: 1,
        display: 'flex',
        alignItems: 'center',
        height: '56px',
        ...containerStyle,
      }}
    >
      {slots?.beforeSearch}
      <TextField
        {...inputProps}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);

          if (inputProps?.onChange) {
            inputProps?.onChange(e);
          }
        }}
        fullWidth={inputProps?.fullWidth ?? true}
        placeholder={
          inputProps?.placeholder ?? translations.tableSearchPlaceholder
        }
        sx={{
          ':hover .input-clear-button': { display: 'flex' },
          ...inputProps?.sx,
        }}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Magnify />
            </InputAdornment>
          ),
          endAdornment: (
            <>
              {search && !inputProps?.disabled ? (
                <InputClearButton onClick={() => setSearch('')} />
              ) : null}
              {inputProps?.InputProps?.endAdornment}
            </>
          ),
          ...inputProps?.InputProps,
        }}
      />
      {FiltersButton}
      {slots?.afterSearch}
    </Box>
  );
}
