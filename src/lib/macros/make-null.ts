import { NullValue } from "@app/types";

export function makeNull(): NullValue {
  return { type: "null", value: null };
}