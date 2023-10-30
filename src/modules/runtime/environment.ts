import {
  BuiltInFunctionValue,
  FunctionValue,
  KEYWORD_LIST,
  NATIVE_FUNCTIONS,
  RuntimeValue,
  TokenTypes,
} from "@app/types";
import {
  makeBoolean,
  makeBuiltInFunction,
  makeNull,
  makeNumber,
  makeObject,
  makeString,
} from "@app/macros";

export function createGlobalEnvironment() {
  const env = new Environment();
  env.defineVariable(TokenTypes.tapped, makeBoolean(true), true);
  env.defineVariable(TokenTypes.untapped, makeBoolean(false), true);
  env.defineVariable(TokenTypes.null, makeNull(), true);

  env.defineVariable(
    NATIVE_FUNCTIONS.reveal,
    makeBuiltInFunction((args: any[]) => {
      console.log(...args);
      return makeNull();
    }),
    true
  );

  env.defineVariable(
    NATIVE_FUNCTIONS.shuffle,
    makeBuiltInFunction((args: any[]) => {
      const strs = args[0] as string;
      const arr = strs.split("");
      const shuffled = arr.sort(() => Math.random() - 0.5);
      return makeString(shuffled.join(""));
    }),
    true
  );

  env.defineVariable(
    NATIVE_FUNCTIONS.count,
    makeBuiltInFunction((args: any[]) => {
      const str = args[0] as string;
      return makeNumber(str.length);
    }),
    true
  );

  env.defineVariable(
    NATIVE_FUNCTIONS.exile,
    makeBuiltInFunction(() => {
      process.exit(0);
    }),
    true
  );

  env.defineVariable(
    NATIVE_FUNCTIONS.sacrifice,
    makeBuiltInFunction((args: any[]) => {
      const name = args[0];
      env.deassignVariable(name);
      return makeNull();
    }),
    true
  );

  env.defineVariable(
    NATIVE_FUNCTIONS.match,
    makeBuiltInFunction((args: any[]) => {
      const string = args[0] as string;
      const regex = args[1] as RegExp;
      const match = string.match(regex);
      return makeBoolean(match ? true : false)
    }),
    true
  );
  return env;
}

export default class Environment {
  constructor(
    private variables: Map<string, RuntimeValue> = new Map(),
    private parent?: Environment,
    private constants: Map<string, RuntimeValue> = new Map(),
    private globalScope = parent ? true : false
  ) {}

  public defineVariable(
    name: string,
    value: RuntimeValue,
    constant: boolean
  ): RuntimeValue {
    this.variables.set(name, value);
    if (constant) this.constants.set(name, value);
    return value;
  }

  public getVariable(name: string): RuntimeValue | undefined {
    return this.variables.get(name) || this.parent?.getVariable(name);
  }

  public assignVariable(name: string, value: RuntimeValue): RuntimeValue {
    if (this.constants.has(name)) {
      console.error(`Cannot reassign to constant ${name}`);
      process.exit(1);
    }

    if (this.variables.has(name)) {
      this.variables.set(name, value);
      return value;
    }

    if (this.parent) {
      this.parent.assignVariable(name, value);
      return value;
    }

    console.error(`Undefined variable ${name}`);
    process.exit(1);
  }

  public deassignVariable(name: string): RuntimeValue {
    if (this.constants.has(name)) {
      console.error(`Cannot reassign to constant ${name}`);
      process.exit(1);
    }

    if (this.variables.has(name)) {
      this.variables.delete(name);
      return makeNull();
    }

    if (this.parent) {
      this.parent.deassignVariable(name);
      return makeNull();
    }

    console.error(`Undefined variable ${name}`);
    process.exit(1);
  }

  public resolveVariable(name: string): Environment {
    if (this.variables.has(name)) {
      return this;
    }

    if (this.parent) {
      return this.parent.resolveVariable(name);
    }

    console.error(`Undefined variable ${name}`);
    process.exit(1);
  }

  public lookupVariable(name: string): RuntimeValue {
    return this.resolveVariable(name).getVariable(name)!;
  }
}
