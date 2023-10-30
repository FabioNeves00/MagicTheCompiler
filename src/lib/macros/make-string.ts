import { StringValue } from "@app/types";

export function makeString(value: string): StringValue {
    return { type: "string", value };
}