import { join } from "path";
import { Parser } from "../../src/modules/parser";

const data = Bun.file(join(import.meta.dir, 'test.mtg'))
const source_code = await data.text()
const parser = new Parser()
console.log(parser.generateAbstractSyntaxTree(source_code))