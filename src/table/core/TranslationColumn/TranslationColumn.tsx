import { Box } from '@mui/material';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { useContext } from 'react';

import { LanguagesContext } from 'form/contexts/LanguagesContext';

import { isValueEmpty } from '../../utils/isValueEmpty';
import { BaseDataTableTranslationColumnDef } from '../BaseDataTable';

export type TranslationColumnProps = GridRenderCellParams<any, any, any>;

export default function TranslationColumn({
  value,
  colDef,
}: TranslationColumnProps) {
  const column = colDef as BaseDataTableTranslationColumnDef;
  const { defaultLanguageId } = useContext(LanguagesContext);

  if (isValueEmpty(value)) {
    return <span>{column.placeholder ?? '—'}</span>;
  }

  const id = column.languageId ?? defaultLanguageId;
  const translation = value && id != null && value[id];
  if (!translation) {
    return <span>{column.placeholder ?? '—'}</span>;
  }

  return <Box>{translation}</Box>;
}
