import ClearIcon from '@mui/icons-material/Clear';
import { Box, IconButton, InputAdornment, Tooltip } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useEffect, useRef } from 'react';
import { useWatch } from 'react-hook-form';

import Form from 'form/Form';
import { AutocompleteInput } from 'form/inputs/AutocompleteInput';
import { CheckboxInput } from 'form/inputs/CheckboxInput';
import { ChipsInput } from 'form/inputs/ChipsInput';
import { DateInput } from 'form/inputs/DateInput';
import { FormInput } from 'form/inputs/FormInput';
import { SelectInput } from 'form/inputs/SelectInput';

import type { RowsCustomFilterFormProps } from './RowsCustomFilterForm.types';

function ChangesWatcher({
  onChange,
  initial,
}: {
  initial: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
}) {
  const values = useWatch();

  const oldValuesRef = useRef<Record<string, any>>(initial);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (
      oldValuesRef.current &&
      JSON.stringify(oldValuesRef.current) === JSON.stringify(values)
    ) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onChange(values);
    }, 200);
    oldValuesRef.current = values;
  }, [values, onChange]);

  return null;
}

export default function RowsCustomFilterForm({
  value,
  onChange,
  inputs,
  onDeleteInput,
}: RowsCustomFilterFormProps) {
  return (
    <Form
      dense
      defaultValues={value}
      sx={{ pb: 1, flex: 'initial' }}
      containerProps={{
        className: 'mui-admin-table-filters-form',
      }}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <ChangesWatcher initial={value} onChange={onChange} />
      {(inputs as any[]).map((inputObj) => {
        const {
          id: input,
          width,
          field,
          name,
          type,
          inputType,
          filter: externalFilter,
          ...filter
        } = inputObj;

        if (type === 'boolean') {
          return (
            <Grid xs="auto" key={input}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', height: '40px' }}
              >
                {/* @ts-ignore */}
                <CheckboxInput
                  {...filter}
                  label={name}
                  name={input}
                  sx={{ ...filter.sx, ml: 0.5 }}
                  xs={filter.xs ?? 'auto'}
                />
                <IconButton
                  edge="end"
                  sx={{ ml: -1 }}
                  onClick={() => {
                    onDeleteInput(inputObj);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  size="small"
                >
                  <ClearIcon sx={{ width: '20px', height: '20px' }} />
                </IconButton>
              </Box>
            </Grid>
          );
        }

        const {
          width: defaultWidth,
          Component,
          props = {},
        } = (() => {
          if (!type || ['text', 'phone', 'tel', 'number'].includes(type)) {
            return { width: 260, Component: FormInput };
          }

          if (type === 'date') {
            return { width: 200, Component: DateInput };
          }

          if (type === 'select') {
            return {
              width: 230,
              Component: SelectInput,
              props: { hideArrow: true },
            };
          }

          if (type === 'autocomplete') {
            return {
              width: 260,
              Component: AutocompleteInput,
              props: {
                disableClearable: true,
                forcePopupIcon: false,
                ...(filter.preset === 'suggestion' && {
                  selection: filter.selection ?? field,
                  itemText: filter.itemText ?? field,
                  distinctOn: filter.distinctOn ?? [field],
                  filter: filter.filter ?? {
                    _and: [
                      { [field]: { _isNull: false } },
                      { [field]: { _niregex: '^ *$' } },
                    ],
                  },
                }),
              },
            };
          }

          if (type === 'chips') {
            return {
              width: 'auto',
              Component: ChipsInput,
              // @ts-ignore
              props: {
                type: inputType,
                sx: { ...filter.sx, '& .MuiInputBase-root': { pr: 1.75 } },
              },
            };
          }

          throw new Error('Not implemented');
        })();

        const inputProps: any = {
          InputLabelProps: { shrink: true },
          InputProps: {
            endAdornment: (
              <InputAdornment
                position="end"
                sx={{ height: '100%', alignSelf: 'center' }}
              >
                <Tooltip title="Удалить фильтр">
                  <IconButton
                    edge="end"
                    onClick={() => {
                      onDeleteInput(inputObj);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    size="small"
                    sx={{ mr: type === 'autocomplete' ? 0.5 : 0 }}
                  >
                    <ClearIcon sx={{ width: '20px', height: '20px' }} />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          },
        };

        return (
          // @ts-ignore
          <Component
            key={input}
            {...filter}
            {...props}
            label={name}
            name={input}
            xs={filter.xs ?? 'auto'}
            sx={{ width: width ?? defaultWidth, ...filter.sx, ...props?.sx }}
            placeholder="Значение фильтра"
            {...(type === 'autocomplete' ? { inputProps } : inputProps)}
          />
        );
      })}
    </Form>
  );
}
