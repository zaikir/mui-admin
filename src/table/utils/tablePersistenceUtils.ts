import { stringify, parse } from "qs";

const aliases = {
  tab: "t",
  search: "q",
  filters: "f",
  page: "p",
  pageSize: "ps",
  sortModelField: "smf",
  sortModelSort: "smo",
};

const flippedAliases = Object.fromEntries(
  Object.entries(aliases).map(([key, value]) => [value, key])
);

type Keys = keyof typeof aliases;

export function updateTableStateInQuery(state: any, prefix = "") {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const currentParams = parse(urlSearchParams.toString());

  Object.values(aliases).forEach((key) => {
    delete currentParams[`${prefix}${key}`];
  });

  const oldQuery = stringify(currentParams);
  const newQuery = stringify(
    Object.fromEntries(
      Object.entries(state).map(([key, value]) => {
        const stringifiedValue = (() => {
          if (
            ["search", "sortModelField", "sortModelSort", "tab"].includes(key)
          ) {
            return value;
          }

          return JSON.stringify(value);
        })();

        return [`${prefix}${aliases[key as Keys]}`, stringifiedValue];
      })
    )
  );

  const queries = [oldQuery, newQuery].filter((x) => x.trim().length);
  const newRelativePathQuery = `${window.location.pathname}${
    queries.length ? `?${queries.join("&")}` : ""
  }`;

  // eslint-disable-next-line no-restricted-globals
  history.replaceState(null, "", newRelativePathQuery);
}

export function parseTableStateFromQuery(prefix = "") {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = [...urlSearchParams.entries()]
    .filter((x) => x[0].startsWith(prefix))
    .map((x) => [x[0].replace(prefix, ""), x[1]]);

  const { sortModelField, sortModelSort, ...rest } = Object.fromEntries(
    Object.entries(parse(params.map((x) => x.join("=")).join("&")))
      .filter((x) => flippedAliases[x[0]])
      .map((x) => {
        if (["q", "smf", "smo", "t"].includes(x[0])) {
          return [flippedAliases[x[0]], x[1]];
        }

        return [flippedAliases[x[0]], JSON.parse(x[1] as string)];
      })
  );

  return {
    ...rest,
    ...(sortModelField &&
      sortModelSort && {
        sortModel: [
          {
            field: sortModelField,
            sort: sortModelSort,
          } as any,
        ],
      }),
  };
}
