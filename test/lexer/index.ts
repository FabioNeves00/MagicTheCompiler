import { Token } from "@app/types";
import { join } from "path";
import { Lexer } from "../../src/modules/lexer";

const data = Bun.file(join(import.meta.dir, 'test.mtg'))
const source_code = await data.text()
const token_list = new Lexer(source_code).tokenize().map((value: Token) => [value.type, value.value])

console.log(token_list)