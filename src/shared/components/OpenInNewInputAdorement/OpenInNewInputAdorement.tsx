import { IconButton, Tooltip } from '@mui/material';
import { OpenInNew } from 'mdi-material-ui';
import { useContext } from 'react';

import { ConfigurationContext } from 'contexts/ConfigurationContext';
import { FormGetter } from 'form/core/FormGetter';

export default function OpenInNewInputAdorement(props: {
  entityId?: string | number;
  field: string;
  baseUrl: string;
}) {
  const { field, baseUrl, entityId } = props;
  const { translations } = useContext(ConfigurationContext);

  const content = (value: any) => (
    <Tooltip title={translations.open}>
      <span>
        <IconButton
          disabled={value == null}
          href={`${baseUrl}/${value}`}
          sx={{ ml: '-7px' }}
        >
          <OpenInNew />
        </IconButton>
      </span>
    </Tooltip>
  );

  if (entityId != null) {
    return content(entityId);
  }

  return (
    <FormGetter names={[field]} render={(values) => content(values[field])} />
  );
}
