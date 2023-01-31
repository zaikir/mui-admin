import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ConfigurationContext } from "contexts/ConfigurationContext";

import {
  FormFetcherContextType,
  FormFetcherField,
  FormFetcherHasuraLocalFieldResolver,
  FormFetcherHasuraRemoteFieldResolver,
  FormFetcherProps,
} from "./FormFetcherContext.types";

export const FormFetcherContext = createContext<FormFetcherContextType>(null);

export function FormFetcher({
  children,
  fetchEntity: fetchEntityFunc,
  method,
  source,
  entityId,
  selector,
  onFetch,
  onSelection,
}: PropsWithChildren<FormFetcherProps>) {
  const Source = source.charAt(0).toUpperCase() + source.slice(1);

  const { hasura } = useContext(ConfigurationContext);
  const [entity, setEntity] = useState<object>();
  const fields = useRef<FormFetcherField[]>([]);

  const register = useCallback((name: FormFetcherField) => {
    if (name && typeof name === "object" && !name.resolver) {
      return;
    }

    if (
      !fields.current.find((x) => (typeof x === "string" ? x : x.name) === name)
    ) {
      fields.current.push(name);
    }
  }, []);

  const unregister = useCallback((name: string) => {
    if (
      fields.current.find((x) => (typeof x === "string" ? x : x.name) === name)
    ) {
      fields.current.splice(
        fields.current.findIndex(
          (x) => (typeof x === "string" ? x : x.name) === name
        ),
        1
      );
    }
  }, []);

  const fetchEntity = useCallback(
    async (resolvers?: string[]) => {
      const allResolvers = !resolvers
        ? fields.current
        : fields.current.filter((x) =>
            resolvers.includes(typeof x === "string" ? x : x.name)
          );

      if (fetchEntityFunc) {
        const fetched = await fetchEntityFunc(
          allResolvers.map((x) => (typeof x === "string" ? x : x.name))
        );
        return fetched;
      }

      if (!method || method === "hasura") {
        const stringResolvers = allResolvers.filter(
          (field) => typeof field === "string"
        ) as string[];

        const localResolvers = allResolvers.filter(
          (field) => typeof field === "object" && !("source" in field.resolver!)
        ) as {
          name: string;
          resolver: FormFetcherHasuraLocalFieldResolver;
        }[];

        const remoteResolvers = allResolvers.filter(
          (field) => typeof field === "object" && "source" in field.resolver!
        ) as {
          name: string;
          resolver: FormFetcherHasuraRemoteFieldResolver;
        }[];

        const selections = [...stringResolvers, ...localResolvers]
          .flatMap((resolver) => {
            if (typeof resolver === "string") {
              return resolver;
            }

            return typeof resolver.resolver.selection === "string"
              ? resolver.resolver.selection
              : resolver.resolver.selection.join(" ");
          })
          .filter((field) => selector?.[field] !== null)
          .map((field) => selector?.[field] ?? field) as string[];

        const uniqueSelections = (onSelection ?? ((x) => x))([
          ...new Set([hasura.primaryKey, ...selections]),
        ]);

        if (!entityId) {
          return Object.assign(
            { _new: true },
            ...allResolvers
              .filter((field) => typeof field === "string")
              .map((field) => ({ [field as string]: null }))
          );
        }

        const where =
          typeof entityId === "object"
            ? entityId
            : { [hasura.primaryKey]: { _eq: entityId } };

        const customResolvers = remoteResolvers.map(
          (x) =>
            x as {
              name: string;
              resolver: FormFetcherHasuraRemoteFieldResolver;
            }
        );

        const customResolversRquestData = customResolvers.map(
          ({ name, resolver }) => {
            const resolverSource = resolver.source;
            const ResolverSource =
              resolverSource.charAt(0).toUpperCase() + resolverSource.slice(1);

            return {
              ...(resolver.filter && {
                variablesDefs: `$where_${name}: ${ResolverSource}BoolExp`,
                variablesValues: [
                  `where_${name}`,
                  { _and: [hasura.removedFilter, resolver.filter] },
                ],
              }),
              query: `items_${name}: ${resolverSource}(where: $where_${name}) { ${
                typeof resolver.selection === "string"
                  ? resolver.selection
                  : resolver.selection.join(" ")
              } }`,
            };
          }
        );

        const customResolversVariablesDefs =
          customResolversRquestData.length > 0
            ? `, ${customResolversRquestData
                .map((x) => x.variablesDefs)
                .join(", ")}`
            : "";

        const { items, ...rest } = await hasura.request(
          {
            type: "custom",
            query: `
          query ${Source}FetchRow($where: ${Source}BoolExp${customResolversVariablesDefs}) {
            items: ${source}(where: $where, limit: 1) {
              ${uniqueSelections.join(" ")}
            }
            ${customResolversRquestData.map((x) => x.query).join(" ")}
          }
        `
              .replace(/\n/g, " ")
              .replace(/ +/g, " ")
              .trim(),
            variables: {
              where,
              ...Object.fromEntries(
                customResolversRquestData
                  .filter((x) => x.variablesValues)
                  .map((x) => x.variablesValues!)
              ),
            },
          },
          { showRemoved: true }
        );

        let item = items[0];
        if (!item) {
          throw new Error("Item not found");
        }

        for (let i = 0; i < localResolvers.length; i += 1) {
          const localResolver = localResolvers[i];

          if (localResolver.resolver.resolveValue) {
            const resolved = localResolver.resolver.resolveValue(item);

            item = {
              ...item,
              ...resolved,
            };
          }
        }

        const customResolversAssigns = Object.fromEntries(
          await Promise.all(
            Object.entries(rest).map(async (x) => {
              const resolverName = x[0].replace("items_", "");
              const resolver = customResolvers.find(
                ({ name }) => name === resolverName
              )!;
              const resolvedValue = await resolver.resolver.resolveItems(
                x[1] as any[]
              );

              return [resolverName, resolvedValue];
            })
          )
        );

        const resultItem = {
          ...item,
          ...customResolversAssigns,
        };

        return resultItem;
      }

      throw new Error(`Unknown fetch method: ${method}`);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [hasura]
  );

  const contextValue = useMemo(
    () => ({
      fetchedEntity: entity,
      register,
      unregister,
      refetch: fetchEntity,
    }),
    [entity, register, unregister, fetchEntity]
  );

  useEffect(() => {
    (async () => {
      const onItemFetch = onFetch ?? ((x) => x);
      const fetchedItem = await fetchEntity();

      setEntity(await onItemFetch(fetchedItem));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FormFetcherContext.Provider value={contextValue}>
      {children}
    </FormFetcherContext.Provider>
  );
}
