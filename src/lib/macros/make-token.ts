import { Token } from "@app/types";

export const makeToken = (value: Token["value"] = "", type: Token["type"]) => {
  return { value, type };
};