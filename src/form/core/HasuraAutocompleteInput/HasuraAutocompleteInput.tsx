import {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ConfigurationContext } from 'contexts/ConfigurationContext';

import { HasuraAutocompleteInputProps } from './HasuraAutocompleteInput.types';
import { FormFetcherContext } from '../../contexts/FormFetcherContext';
import { BaseAutocompleteInput } from '../BaseAutocompleteInput';
import { AutocompleteOption } from '../BaseAutocompleteInput/BaseAutocompleteInput.types';
import { FormGetter } from '../FormGetter';

export default function HasuraAutocompleteInput<
  TOption extends AutocompleteOption,
  TFields extends Record<string, any>,
  M extends boolean | undefined = undefined,
  D extends boolean | undefined = undefined,
  F extends boolean | undefined = undefined,
>(props: HasuraAutocompleteInputProps<TFields, TOption, M, D, F>) {
  const {
    source,
    selection,
    filter,
    orderBy,
    distinctOn,
    limit,
    itemValue,
    itemText,
    fetchAll,
    preset,
    controlRef,
    disableFetch,
    skipFetchContextCheck,
    primaryKey = 'id',
    onSelection = null,
    onFetch = null,
    ...rest
  } = (() => {
    if (props.preset === 'suggestion') {
      return {
        ...props,
        fetchAll: props.fetchAll ?? true,
        freeSolo: props.freeSolo ?? true,
        selection: props.selection ?? props.name,
        itemText: props.itemText ?? props.name,
        distinctOn: props.distinctOn ?? [props.name],
        filter: props.filter ?? {
          _and: [
            { [props.name]: { _isNull: false } },
            { [props.name]: { _niregex: '^ *$' } },
          ],
        },
      };
    }

    return {
      ...props,
      fetchAll: props.fetchAll ?? true,
    };
  })();

  const { hasura, onSearch } = useContext(ConfigurationContext);
  const formFetcherContext = useContext(FormFetcherContext);
  const [value, setValue] = useState(
    rest.value != null ? rest.value : undefined,
  );
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const debounceTimeout = useRef<NodeJS.Timeout>();
  const skipNextFetch = useRef<boolean | null>(null);
  const isFetchAllCompleted = useRef(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const removedKeys = Object.keys(hasura.removeUpdate);
  const selectedOption =
    value != null &&
    !rest.multiple &&
    items.find((x) => x[primaryKey] === value);

  const Source = source.charAt(0).toUpperCase() + source.slice(1);

  const sourceFilter = useMemo(() => {
    if (value === undefined && formFetcherContext && !skipFetchContextCheck) {
      return null;
    }

    const searchStrings = onSearch(inputValue);

    if (!fetchAll && typeof itemText === 'function' && inputValue.length) {
      // eslint-disable-next-line no-console
      // console.error('Filter function is required (!itemText && itemText is function)');
    }

    const baseFilter = {
      _and: [
        ...(hasura.filter ? [hasura.filter] : []),
        ...(filter
          ? [
              typeof filter === 'function'
                ? { _or: searchStrings.map((str) => filter(str)) }
                : filter,
            ]
          : []),
        ...(!filter && !fetchAll && inputValue.length
          ? [
              {
                _or: searchStrings.map((str) => ({
                  [itemText as string]: { _ilike: `%${str}%` },
                })),
              },
            ]
          : []),
      ],
    };

    const selectedRowsFilter = (() => {
      if (rest.freeSolo || value == null || isFetchAllCompleted.current) {
        return null;
      }

      if (rest.multiple) {
        return {
          // @ts-ignore
          [primaryKey]: {
            _in: rest.keepObject ? value.map((x) => x.value) : value,
          },
        };
      }

      // @ts-ignore
      return { [primaryKey]: { _eq: rest.keepObject ? value.value : value } };
    })();

    return {
      base: baseFilter._and.length > 0 ? baseFilter : null,
      selected: selectedRowsFilter,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filter,
    hasura,
    inputValue,
    itemText,
    onSearch,
    rest.freeSolo,
    rest.keepObject,
    rest.multiple,
    value,
    formFetcherContext,
    skipFetchContextCheck,
  ]);

  const fetchRows = useCallback(
    async (
      rowsFilter: {
        base: Record<string, any> | null;
        selected: Record<string, any> | null;
      } | null,
    ) => {
      if (!rowsFilter) {
        return;
      }

      setIsLoading(true);

      const onSelectionFunc = onSelection || ((x: any) => x);
      const allSelections = onSelectionFunc([
        hasura.primaryKey,
        ...(typeof selection === 'string' ? [selection] : selection),
      ]);
      const selections = [...new Set(allSelections)];

      if (!selections.length) {
        // eslint-disable-next-line no-console
        console.error('Selections list cannot be empty');
      }

      const includeSelectedItemsQuery = !!rowsFilter.selected;
      const result: { items: any[]; selectedItems?: any[] } =
        await hasura.request(
          {
            type: 'custom',
            query: `
        query ${Source}FetchRows($where: ${Source}BoolExp, $orderBy: [${Source}OrderBy!], $distinctOn: [${Source}SelectColumn!], $limit: Int
          ${
            includeSelectedItemsQuery
              ? `, $where_selectedItems: ${Source}BoolExp`
              : ''
          }
        ) {
          items: ${source}(where: $where, orderBy: $orderBy, distinctOn: $distinctOn, limit: $limit) {
            ${selections.join(' ')}
          }
          ${
            includeSelectedItemsQuery
              ? `
          selectedItems: ${source}(where: $where_selectedItems) {
            ${[...selections, ...removedKeys].join(' ')}
          }
          `
              : ''
          }
        }
      `
              .replace(/\n/g, ' ')
              .replace(/ +/g, ' ')
              .trim(),
            variables: {
              where: {
                _and: [
                  ...(rowsFilter.base ? [rowsFilter.base] : []),
                  ...(hasura.removedFilter ? [hasura.removedFilter] : []),
                  ...(includeSelectedItemsQuery
                    ? [{ _not: rowsFilter.selected }]
                    : []),
                ],
              },
              ...(includeSelectedItemsQuery && {
                where_selectedItems: rowsFilter.selected,
              }),
              ...(orderBy && { orderBy }),
              ...(distinctOn && { distinctOn }),
              ...(!fetchAll && { limit: limit ?? 20 }),
            },
          },
          { showRemoved: true },
        );

      const { items: fetchedItems, selectedItems } = result;

      let resultFetchedItems = [];
      if (
        !fetchAll &&
        selectedItems?.length &&
        skipNextFetch.current === null
      ) {
        skipNextFetch.current = true;
        resultFetchedItems = selectedItems;
      } else {
        resultFetchedItems = selectedItems
          ? [...fetchedItems, ...selectedItems]
          : fetchedItems;
      }

      if (fetchAll) {
        isFetchAllCompleted.current = true;
      }

      setItems(
        // @ts-ignore
        onFetch ? await onFetch(resultFetchedItems) : resultFetchedItems,
      );
      setIsLoading(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [],
  );

  const debouncedFetchRows = useCallback(
    (rowsFilter: any, force: boolean = false) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      if (skipNextFetch.current) {
        skipNextFetch.current = false;
        return;
      }

      if (
        isFetchAllCompleted.current &&
        !rowsFilter?.base &&
        !rowsFilter?.selected &&
        !force
      ) {
        return;
      }

      debounceTimeout.current = setTimeout(() => {
        fetchRows(rowsFilter);
      }, 200);
    },
    [fetchRows],
  );

  const sourceFilterMemoizationKey =
    sourceFilter && JSON.stringify(sourceFilter);

  useEffect(() => {
    if (disableFetch || !sourceFilterMemoizationKey) {
      return;
    }

    debouncedFetchRows(sourceFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceFilterMemoizationKey, disableFetch, debouncedFetchRows]);

  useImperativeHandle(
    controlRef,
    () => ({
      refetch: () => {
        debouncedFetchRows(sourceFilter, true);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [debouncedFetchRows, sourceFilterMemoizationKey],
  );

  return (
    <>
      <BaseAutocompleteInput
        {...rest}
        {...(!fetchAll && {
          inputValue,
          onInputChange: (event, x) => setInputValue(x),
          filterOptions: (options) => options,
        })}
        loading={isLoading}
        options={items.map(
          (item) =>
            ({
              text:
                typeof itemText === 'function'
                  ? itemText(item)
                  : item[itemText],
              value:
                typeof itemValue === 'function'
                  ? itemValue(item)
                  : item[itemValue ?? primaryKey],
              item,
            } as TOption),
        )}
        {...(selectedOption &&
          !Object.keys(hasura.removeUpdate).find(
            (key) => selectedOption[key] !== true,
          ) && {
            inputProps: {
              ...rest.inputProps,
              inputProps: {
                ...rest.inputProps?.inputProps,
                sx: {
                  ...rest.inputProps?.inputProps?.sx,
                  color: '#c00021',
                },
              },
            },
          })}
      />
      <FormGetter
        names={[rest.name]}
        onChange={(values) => {
          setValue(values[rest.name]);
        }}
      />
    </>
  );
}
