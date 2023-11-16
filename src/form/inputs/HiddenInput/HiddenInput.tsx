import { FormFetcherHasuraFieldResolver } from 'form/contexts/FormFetcherContext';
import { FormSubmitterValueResolver } from 'form/contexts/FormSubmitterContext';

import { BaseInput } from '../../core/BaseInput';

export default function HiddenInput({
  name,
  formFetcherValueResolver,
  formSubmitterValueResolver,
}: {
  name: string;
  formFetcherValueResolver?: FormFetcherHasuraFieldResolver;
  formSubmitterValueResolver?: FormSubmitterValueResolver;
}): JSX.Element {
  return (
    <BaseInput
      name={name}
      skeleton={false}
      grid={false}
      formFetcherValueResolver={formFetcherValueResolver}
      formSubmitterValueResolver={formSubmitterValueResolver}
      render={() => null as any}
    />
  );
}
