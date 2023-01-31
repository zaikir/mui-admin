import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react';

import { NotificationsContext } from 'contexts/NotificationsContext';
import { FormElementRef } from 'form/Form.types';

import {
  FormHasuraSubmitterProps,
  FormRestSubmitterProps,
  FormSubmitterContextType,
  FormSubmitterDefaultValueResolver,
  FormSubmitterField,
  FormSubmitterHasuraManyToManyValueResolver,
  FormSubmitterProps,
} from './FormSubmitterContext.types';
import { PromiseOrValue } from '../../..';
import { ConfigurationContext } from '../../../contexts/ConfigurationContext';

export const FormSubmitterContext =
  createContext<FormSubmitterContextType>(null);

export function FormSubmitter({
  children,
  mode,
  clearEntity,
  preSubmit,
  onSubmit: onSuccess,
  entityId,
  resetAfterSubmit,
  showSuccessAlert,
  ...rest
}: PropsWithChildren<FormSubmitterProps>) {
  const {
    rest: { client: restClient },
    hasura,
    alerts,
  } = useContext(ConfigurationContext);
  const { showAlert } = useContext(NotificationsContext);
  const fields = useRef<FormSubmitterField[]>([]);

  const hasuraProps = rest as FormHasuraSubmitterProps;

  const hasuraSubmit = useCallback(
    async (entity: any) => {
      const { source, selection, ignoreFields } = hasuraProps;

      const Source = source.charAt(0).toUpperCase() + source.slice(1);
      const selections = ((await selection) ?? ['__typename']).join(' ');

      const where = (() => {
        if (!entityId) {
          return null;
        }

        return typeof entityId === 'object'
          ? entityId
          : { [hasura.primaryKey]: { _eq: entityId } };
      })();

      const fieldsWithoutResolver = fields.current.filter((x) => !x.resolver);

      const defaultResolvers = fields.current.filter(
        (field) =>
          field.resolver &&
          (!field.resolver.type || field.resolver.type === 'default'),
      ) as {
        name: string;
        resolver: FormSubmitterDefaultValueResolver;
      }[];

      const manyToManyResolvers = fields.current.filter(
        (field) =>
          field.resolver && field.resolver.type === 'hasura-many-to-many',
      ) as {
        name: string;
        resolver: FormSubmitterHasuraManyToManyValueResolver;
      }[];

      const manyToManyResolversQuery = manyToManyResolvers.map((x) => {
        const resolverSource = x.resolver.source;
        const ResolverSource =
          resolverSource.charAt(0).toUpperCase() + resolverSource.slice(1);

        return {
          query: `items_${x.name}: ${resolverSource} (where: $where_${x.name}) { ${x.resolver.foreignKey} }`,
          variablesDefs: `$where_${x.name}: ${ResolverSource}BoolExp`,
          variables: {
            [`where_${x.name}`]: Object.fromEntries(
              Object.entries(x.resolver.entityId).map((y) => [
                [y[0]],
                { _eq: y[1] },
              ]),
            ),
          },
        };
      });

      const manyToManyResolversQueryResults =
        manyToManyResolversQuery.length > 0 &&
        (await hasura.request({
          type: 'custom',
          query: `query FetchManyToManyItems (${manyToManyResolversQuery
            .map((x) => x.variablesDefs)
            .join(', ')}) {
        ${manyToManyResolversQuery.map((x) => x.query).join(' ')}
      }`
            .replace(/\n/g, ' ')
            .replace(/ +/g, ' ')
            .trim(),
          variables: Object.assign(
            {},
            ...manyToManyResolversQuery.map((x) => x.variables),
          ),
        }));

      const manyToManyMutations =
        manyToManyResolversQueryResults &&
        manyToManyResolvers.flatMap((x) => {
          const resolverSource = x.resolver.source;
          const ResolverSource =
            resolverSource.charAt(0).toUpperCase() + resolverSource.slice(1);

          const oldIds = manyToManyResolversQueryResults[`items_${x.name}`].map(
            (y: any) => y[x.resolver.foreignKey],
          );
          const newIds = entity[x.name] || [];

          const idsToRemove = oldIds.filter((id: any) => !newIds.includes(id));
          const idsToAdd = newIds.filter((id: any) => !oldIds.includes(id));

          return {
            mutation: [
              ...(idsToAdd.length
                ? [
                    `result_insert_${x.name}: insert${ResolverSource} (objects: $insert_${x.name}) { affected_rows }`,
                  ]
                : []),
              ...(idsToRemove.length
                ? [
                    `result_remove_${x.name}: update${ResolverSource} (where: $where_remove_${x.name}, _set: $set_remove_${x.name}) { affected_rows }`,
                  ]
                : []),
            ].join(' '),
            variablesDefs: [
              ...(idsToAdd.length
                ? [`$insert_${x.name}: [${ResolverSource}InsertInput!]!`]
                : []),
              ...(idsToRemove.length
                ? [
                    `$where_remove_${x.name}: ${ResolverSource}BoolExp!, $set_remove_${x.name}: ${ResolverSource}SetInput`,
                  ]
                : []),
            ].join(', '),
            variables: {
              ...(idsToAdd.length && {
                [`insert_${x.name}`]: idsToAdd.map((id: any) => ({
                  [x.resolver.foreignKey]: id,
                  ...x.resolver.entityId,
                })),
              }),
              ...(idsToRemove.length && {
                [`where_remove_${x.name}`]: {
                  ...Object.fromEntries(
                    Object.entries(x.resolver.entityId).map((y) => [
                      [y[0]],
                      { _eq: y[1] },
                    ]),
                  ),
                  [x.resolver.foreignKey]: { _in: idsToRemove },
                },
                [`set_remove_${x.name}`]: hasura.removeUpdate,
              }),
            },
          };
        });

      const additionalVariablesDef = manyToManyMutations
        ? `, ${manyToManyMutations.map((x: any) => x.variablesDefs).join(', ')}`
        : '';
      const additionalVariables = manyToManyMutations
        ? Object.assign({}, ...manyToManyMutations.map((x: any) => x.variables))
        : {};
      const additionalMutation = manyToManyMutations
        ? manyToManyMutations.map((x: any) => x.mutation).join(' ')
        : '';

      let entityCopy = { ...entity };

      defaultResolvers.forEach((resolver) => {
        const resolved = resolver.resolver.resolveValue(entityCopy);

        entityCopy = {
          ...entityCopy,
          ...resolved,
        };
      });

      const fieldsToDelete = [
        ...(ignoreFields ?? []),
        ...defaultResolvers.map((resolver) => resolver.name),
        ...manyToManyResolvers.map((resolver) => resolver.name),
        ...fieldsWithoutResolver.map((x) => x.name),
      ];

      fieldsToDelete.forEach((field) => {
        // eslint-disable-next-line no-param-reassign
        delete entityCopy[field];
      });

      const response = where
        ? hasura
            .request({
              type: 'custom',
              query:
                `mutation UpdateEntity ($where: ${Source}BoolExp!, $set: ${Source}SetInput${additionalVariablesDef}) {
          result: update${Source}(where: $where, _set: $set) {
            items: returning {
              ${selections}
            }
          }
          ${additionalMutation}
        }`
                  .replace(/\n/g, ' ')
                  .replace(/ +/g, ' ')
                  .trim(),
              variables: {
                where,
                set: entityCopy,
                ...additionalVariables,
              },
            })
            .then((x) => x.result.items[0])
        : await hasura
            .request({
              type: 'custom',
              query:
                `mutation InsertEntity($insert: ${Source}InsertInput!${additionalVariablesDef}) {
          item: insert${Source}One(object: $insert) {
            ${selections}
          }
          ${additionalMutation}
        }`
                  .replace(/\n/g, ' ')
                  .replace(/ +/g, ' ')
                  .trim(),
              variables: {
                insert: entityCopy,
                ...additionalVariables,
              },
            })
            .then((x) => x.item);

      return response;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [entityId],
  );

  const restProps = rest as FormRestSubmitterProps;
  const restSubmit = useCallback(
    async (entity: object) => {
      const { url, method } =
        typeof restProps.url === 'function'
          ? await restProps.url(entity)
          : { url: restProps.url, method: entityId ? 'PUT' : 'POST' };

      const response = await restClient({
        url,
        method,
        data: {
          ...entity,
          ...(entityId != null && { id: entityId }),
        },
      });

      return response.data;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [entityId, restProps.url],
  );

  const onSubmit: (
    item: any,
    { ref }: { ref: FormElementRef },
  ) => PromiseOrValue<void> = useCallback(
    async (entity, { ref: formRef }) => {
      const clearedtEntity = clearEntity
        ? await clearEntity(entity)
        : (() =>
            Object.fromEntries(
              Object.entries(entity).map(([key, value]) => [
                key,
                typeof value === 'string' ? value.trim() : value,
              ]),
            ))();

      const resultEntity = preSubmit
        ? await preSubmit(clearedtEntity)
        : clearedtEntity;
      if (!resultEntity) {
        return;
      }

      let result = null;
      if (!mode || mode === 'hasura') {
        result = await hasuraSubmit(resultEntity);
      } else if (mode === 'rest') {
        result = await restSubmit(resultEntity);
      } else {
        throw new Error(`Unknown method: ${mode}`);
      }

      if (onSuccess) {
        await onSuccess(result);
      }

      if (showSuccessAlert ?? true) {
        if (entityId) {
          showAlert(
            alerts.snackbars.entityUpdated.text,
            alerts.snackbars.entityUpdated.variant,
          );
        } else {
          showAlert(
            alerts.snackbars.entityCreated.text,
            alerts.snackbars.entityCreated.variant,
          );
        }
      }

      if (resetAfterSubmit ?? true) {
        formRef.reset(resultEntity);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [mode, restSubmit, hasuraSubmit, onSuccess, entityId],
  );

  const register = useCallback((field: FormSubmitterField) => {
    if (!fields.current.find((x) => x.name === field.name)) {
      fields.current.push(field);
    }
  }, []);

  const unregister = useCallback((name: string) => {
    if (fields.current.find((x) => x.name === name)) {
      fields.current.splice(
        fields.current.findIndex((x) => x.name === name),
        1,
      );
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      onSubmit,
      register,
      unregister,
    }),
    [onSubmit, register, unregister],
  );

  return (
    <FormSubmitterContext.Provider value={contextValue}>
      {children}
    </FormSubmitterContext.Provider>
  );
}
