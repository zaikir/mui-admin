import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  TextField,
  ListItemText,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import Menu from '@mui/material/Menu';
import { useContext, useEffect, useMemo, useState } from 'react';

import { ConfigurationContext } from 'contexts/ConfigurationContext';

import { AddCustomFilterMenuProps } from './AddCustomFilterMenu.types';

export default function AddCustomFilterMenu({
  anchorEl,
  filters,
  onSelect,
  onClose,
}: AddCustomFilterMenuProps) {
  const { onSearch } = useContext(ConfigurationContext);
  const [search, setSearch] = useState('');

  const filteredFilters = useMemo(
    () =>
      filters
        // .sort((a, b) => a.name.localeCompare(b.name))
        .filter((x) => {
          const trimmedSearch = search.trim().toLowerCase();
          if (!trimmedSearch.length) {
            return true;
          }

          const strings = onSearch(trimmedSearch);
          return strings.some((str) =>
            x.name?.toLowerCase().includes(str.toLowerCase()),
          );
        }),
    [filters, search, onSearch],
  );

  useEffect(() => {
    if (anchorEl) {
      setSearch('');
    }
  }, [anchorEl]);

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      MenuListProps={{
        sx: {
          py: 0,
          minWidth: 200,
        },
      }}
    >
      {filters.length > 1 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();

            if (!filteredFilters.length) {
              onClose();
              return;
            }

            if (filteredFilters.length === 1) {
              onSelect(filteredFilters[0]);
            }
          }}
        >
          <TextField
            fullWidth
            size="small"
            value={search}
            autoComplete="nope"
            autoFocus
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </form>
      )}
      <Box sx={{ overflow: 'auto', maxHeight: 300 }}>
        {filteredFilters.map((filter) => (
          <MenuItem key={filter.name} onClick={() => onSelect(filter)}>
            <ListItemText sx={{ py: 0.7 }}>{filter.name}</ListItemText>
          </MenuItem>
        ))}
      </Box>
    </Menu>
  );
}
