import { FieldPath } from "firebase/firestore";

type RecursiveKeyOf<T> = T extends object ? {
  [K in keyof T & (string | number)]: K | `${K & string}.${RecursiveKeyOf<T[K]> & string}`
}[keyof T & (string | number)] : never;

export type NestedKeyOf<ObjectType extends object> = Extract<RecursiveKeyOf<ObjectType>, string> | FieldPath;

type NestedData =
  | {
      [key: string]: unknown;
    }
  | Array<unknown>;

function isNestedData(value: unknown): value is NestedData {
  return (
    typeof value === "object" &&
    value !== null &&
    (Array.isArray(value) || Object.prototype.toString.call(value) === "[object Object]")
  );
}

export function findInNestedDict(data: NestedData, key: string): unknown {
  if (typeof data === "object" && !Array.isArray(data)) {
    for (const ikey in data) {
      if (ikey === key) {
        return data[ikey];
      }
      const nestedValue = data[ikey];
      if (isNestedData(nestedValue)) {
        const result = findInNestedDict(nestedValue, key);
        if (result !== undefined) {
          return result;
        }
      }
    }
  } else if (Array.isArray(data)) {
    for (const item of data) {
      if (isNestedData(item)) {
        const result = findInNestedDict(item, key);
        if (result !== undefined) {
          return result;
        }
      }
    }
  }
  return undefined;
}
