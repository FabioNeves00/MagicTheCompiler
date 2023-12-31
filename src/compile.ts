import { join } from "path"
import { Parser } from "./modules/parser";
import { createGlobalEnvironment } from "./modules/runtime/environment";
import { evaluateProgram } from "./modules/runtime/interpreter";

const data = Bun.file(Bun.argv[2])
const source_code = await data.text()
const evaluated = evaluateProgram(
  new Parser().generateAbstractSyntaxTree(source_code),
  createGlobalEnvironment()
);
