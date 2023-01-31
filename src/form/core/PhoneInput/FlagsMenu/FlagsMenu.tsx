import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  TextField,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Typography,
  InputAdornment,
} from '@mui/material';
import Menu from '@mui/material/Menu';
import { useContext, useEffect, useState } from 'react';

import { ConfigurationContext } from 'contexts/ConfigurationContext';

import Flag from '../Flag/Flag';
import { PhoneTemplates } from '../phones';

const DisplayNames = new Intl.DisplayNames([], {
  type: 'region',
});

const countries = PhoneTemplates.map((x) => ({
  id: x[0],
  code: x[1],
  name: DisplayNames.of(x[0])!,
}));

export default function FlagsMenu({
  anchorEl,
  selectedCountry,
  onSelectCountry,
  onClose,
}: any) {
  const { onSearch } = useContext(ConfigurationContext);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setSearch('');
  }, [anchorEl]);

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      MenuListProps={{
        sx: {
          py: 0,
        },
      }}
    >
      <TextField
        fullWidth
        size="small"
        value={search}
        autoComplete="nope"
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <Box sx={{ overflow: 'auto', maxHeight: 300 }}>
        {countries
          .sort((a, b) => a.name.localeCompare(b.name))
          .filter((x) => {
            const trimmedSearch = search.trim().toLowerCase();
            if (!trimmedSearch.length) {
              return true;
            }

            const strings = onSearch(trimmedSearch);
            return strings.some(
              (str) =>
                x.name?.toLowerCase().includes(str.toLowerCase()) ||
                x.code?.toLowerCase().includes(str.toLowerCase()) ||
                x.id.toLowerCase().includes(str.toLowerCase()),
            );
          })
          .map((country) => (
            <MenuItem
              key={country.id}
              onClick={() => onSelectCountry(country.id)}
              selected={selectedCountry === country.id}
            >
              <ListItemIcon>
                <Flag isoCode={country.id} />
              </ListItemIcon>
              <ListItemText>{country.name}</ListItemText>
              <Typography variant="body2" color="text.secondary">
                +{country.code}
              </Typography>
            </MenuItem>
          ))}
      </Box>
    </Menu>
  );
}
