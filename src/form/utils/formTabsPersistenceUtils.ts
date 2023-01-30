import { stringify, parse } from "qs";

const aliases = {
  tab: "t",
};

const flippedAliases = Object.fromEntries(
  Object.entries(aliases).map(([key, value]) => [value, key])
);

type Keys = keyof typeof aliases;

export function updateFormTabsStateInQuery(state: any, prefix = "") {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const currentParams = parse(urlSearchParams.toString());

  Object.values(aliases).forEach((key) => {
    delete currentParams[`${prefix}${key}`];
  });

  const oldQuery = stringify(currentParams);
  const newQuery = stringify(
    Object.fromEntries(
      Object.entries(state).map(([key, value]) => {
        const stringifiedValue = (() => value)();

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

export function parseFormTabsStateFromQuery(prefix = "") {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = [...urlSearchParams.entries()]
    .filter((x) => x[0].startsWith(prefix))
    .map((x) => [x[0].replace(prefix, ""), x[1]]);

  const { ...rest } = Object.fromEntries(
    Object.entries(parse(params.map((x) => x.join("=")).join("&")))
      .filter((x) => flippedAliases[x[0]])
      .map((x) => [flippedAliases[x[0]], x[1]])
  );

  return {
    ...rest,
  };
}
