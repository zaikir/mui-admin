export const isValueEmpty = (value: any) =>
  value == null || (typeof value === "string" && !value.length);
