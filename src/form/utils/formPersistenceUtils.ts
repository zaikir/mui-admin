import { stringify, parse } from "qs";

export function updateFormStateInQuery(state: any, prefix = "", json = false) {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const currentParams = parse(urlSearchParams.toString());

  Object.values(Object.keys(state)).forEach((key) => {
    delete currentParams[`${prefix}${key}`];
  });

  const oldQuery = stringify(currentParams);
  const newQuery = stringify(
    Object.fromEntries(
      Object.entries(state).map(([key, value]) => {
        const stringifiedValue = (() =>
          json ? JSON.stringify(value) : value)();

        return [`${prefix}${key}`, stringifiedValue];
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

export function parseFormStateFromQuery(prefix = "", json = false) {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = [...urlSearchParams.entries()]
    .filter((x) => x[0].startsWith(prefix))
    .map((x) => [x[0].replace(prefix, ""), x[1]]);

  const { ...rest } = Object.fromEntries(
    Object.entries(parse(params.map((x) => x.join("=")).join("&"))).map((x) => [
      x[0],
      json ? JSON.parse(x[1] as string) : x[1],
    ])
  );

  return {
    ...rest,
  };
}
