import { Box, Skeleton, TextFieldProps, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { useContext } from 'react';
import { FieldValues } from 'react-hook-form/dist/types/fields';

import { FormConfigContext } from 'form/contexts/FormConfigContext';
import { LanguagesContext } from 'form/contexts/LanguagesContext';
import { BaseInput, BaseInputProps } from 'form/core/BaseInput';

import { FormInput } from '../FormInput';

type GridProps = React.ComponentProps<typeof Grid>;

export type TranslationInputProps<TFields extends FieldValues> =
  BaseInputProps<TFields> &
    Omit<TextFieldProps, 'name' | 'type'> & {
      gridCols?: {
        xs?: GridProps['xs'];
        sm?: GridProps['sm'];
        md?: GridProps['md'];
        lg?: GridProps['lg'];
        xl?: GridProps['xl'];
      };
    };

export default function TranslationInput<TFields extends FieldValues>({
  label,
  name,
  value: controlledValue,
  xs,
  sm,
  md,
  lg,
  xl,
  grid,
  gridCols,
  ...rest
}: TranslationInputProps<TFields>): JSX.Element {
  const { languages } = useContext(LanguagesContext);
  const { spacing } = useContext(FormConfigContext);

  return (
    <BaseInput<TFields>
      name={name}
      value={controlledValue}
      xs={xs || 12}
      sm={sm}
      md={md ?? 12}
      lg={lg ?? 12}
      xl={xl ?? 12}
      grid={grid}
      render={({ skeleton, field: { value, onChange } }) => (
        <Box>
          {label && (
            <Typography variant="subtitle2" mb={1} sx={{ opacity: 0.8 }}>
              {skeleton ? <Skeleton width={150} /> : <span>{label}</span>}
            </Typography>
          )}
          <Grid container spacing={spacing}>
            {languages.map((language) => (
              <Grid
                key={language.id}
                xs={gridCols?.xs ?? 12}
                sm={gridCols?.sm ?? 6}
                md={gridCols?.md ?? 4}
                lg={gridCols?.lg ?? 3}
                xl={gridCols?.xl}
              >
                {skeleton ? (
                  <Skeleton width="75%" />
                ) : (
                  <FormInput
                    grid={false}
                    name={`${name}_${language.id}`}
                    label={language.name}
                    formFetcherValueResolver={null}
                    formSubmitterValueResolver={null}
                    onChange={(x) => {
                      onChange({
                        target: {
                          value: {
                            ...value,
                            [`${name}_${language.id}`]: x.target.value ?? null,
                          },
                        },
                      });
                    }}
                    {...rest}
                  />
                )}
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    />
  );
}
