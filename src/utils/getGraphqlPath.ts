import { gql } from "graphql-tag";

function buildPathToNextField(selection: any, prepend = "") {
  if (!selection.selectionSet) {
    if (
      selection.name.value.startsWith("__") &&
      selection.name.value.endsWith("__")
    ) {
      return `${prepend}.${selection.name.value}`;
    }
    return prepend;
  }

  const pathes = selection.selectionSet.selections.map((s: any) =>
    buildPathToNextField(s, `${prepend}.${selection.name.value}`)
  );
  return pathes.flat();
}

export function getGraphqlPath(selection: string): string[] {
  if (!selection.includes("*")) {
    return [selection];
  }

  const parsedGql = gql(`query {${selection.replace(/\*/g, "__")}}`)
    .definitions[0];
  const pathes = buildPathToNextField(
    // @ts-ignore
    parsedGql.selectionSet.selections[0]
  )
    .find((x: any) => x.includes("__"))
    .replace(/__/g, "")
    .split(".")
    .filter((x: any) => x.length);

  return pathes;
}
