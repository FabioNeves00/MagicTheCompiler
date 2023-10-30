import { BooleanValue } from "@app/types";

export function makeBoolean(value: boolean): BooleanValue {
    return { type: "boolean", value };
}