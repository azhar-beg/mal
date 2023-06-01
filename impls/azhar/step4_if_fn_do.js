const readline = require("readline");
const { read_str } = require("./reader.js");
const { pr_str } = require("./printer.js");
const { ns } = require("./core.js");

const {
  MalSymbol,
  MalList,
  MalVector,
  MalHashMap,
  MalNil,
} = require("./types.js");
const { Env } = require("./env.js");

const READ = (str) => read_str(str);

const env = new Env();
Object.keys(ns).forEach((key) => {
  env.set(new MalSymbol(key), ns[key]);
});

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    return env.get(ast);
  }

  if (ast instanceof MalVector) {
    const newAst = ast.value.map((x) => EVAL(x, env));
    return new MalVector(newAst);
  }

  if (ast instanceof MalHashMap) {
    const newAst = ast.value.map((x) => EVAL(x, env));
    return new MalHashMap(newAst);
  }

  if (ast instanceof MalList) {
    const newAst = ast.value.map((x) => EVAL(x, env));
    return new MalList(newAst);
  }

  return ast;
};

const createNewEnv = (env, bindingList) => {
  const newEnv = new Env(env);
  for (let index = 0; index < bindingList.length; index += 2) {
    newEnv.set(bindingList[index], EVAL(bindingList[1 + index], newEnv));
  }
  return newEnv;
};

const evalDo = (list, env) => {
  let result;
  for (let i = 0; i < list.length; i++) {
    result = EVAL(list[i], env);
  }
  return result;
};

const evalIf = (list, env) => {
  const [condition, firsExpr, secondExpr] = list;
  const evaluatedCond = EVAL(condition, env);

  const result = ["nil", false].includes(pr_str(evaluatedCond))
    ? EVAL(secondExpr, env)
    : EVAL(firsExpr, env);

  return result ?? new MalNil();
};

const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) {
    return eval_ast(ast, env);
  }

  if (ast.isEmpty()) {
    return ast;
  }

  switch (ast.value[0].value) {
    case "def!":
      env.set(ast.value[1], EVAL(ast.value[2], env));
      return env.get(ast.value[1]);
    case "let*":
      const bindingList = ast.value[1].value;
      return EVAL(ast.value[2], createNewEnv(env, bindingList));
    case "do":
      return evalDo(ast.value.slice(1), env);
    case "if":
      return evalIf(ast.value.slice(1), env);
    case "fn*":
      return (...exprs) => {
        const fnEnv = new Env(env, ast.value[1], exprs);
        return EVAL(ast.value[2], fnEnv);
      };
  }

  const [fn, ...args] = eval_ast(ast, env).value;
  return fn.apply(null, args) ?? new MalNil();
};

const PRINT = (str) => pr_str(str);

const rep = (str) => PRINT(EVAL(READ(str), env));

env.set(new MalSymbol("not"), rep("(def! not (fn* (a) (if a false true)))"));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const repl = () => {
  rl.question("user> ", (line) => {
    try {
      console.log(rep(line));
    } catch (error) {
      console.log(error);
    }
    repl();
  });
};

repl();
