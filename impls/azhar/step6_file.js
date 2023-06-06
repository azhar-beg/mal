const readline = require("readline");
const { read_str } = require("./reader.js");
const { pr_str } = require("./printer.js");
const { ns } = require("./core.js");

const {
  MalFunction,
  MalSymbol,
  MalList,
  MalVector,
  MalHashMap,
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

const handleDef = (ast, env) => {
  env.set(ast.value[1], EVAL(ast.value[2], env));
  return env.get(ast.value[1]);
};

const handleLet = (ast, env) => {
  const [bindings, ...forms] = ast.value.slice(1);
  const newEnv = createNewEnv(env, bindings);
  const doForms = new MalList([new MalSymbol("do"), ...forms]);

  return [doForms, newEnv];
};

const handleDo = (ast, env) => {
  const [...forms] = ast.value.slice(1);
  for (let i = 0; i < forms.length - 1; i++) {
    EVAL(forms[i], env);
  }
  return forms[forms.length - 1];
};

const handleIf = (ast, env) => {
  const [condition, firsExpr, secondExpr] = ast.value.slice(1);
  const evaluatedCond = EVAL(condition, env);

  const result = ["nil", false].includes(pr_str(evaluatedCond))
    ? secondExpr
    : firsExpr;

  return result;
};

const handleFn = (ast, env) => {
  const [binds, ...body] = ast.value.slice(1);
  const doForms = new MalList([new MalSymbol("do"), ...body]);

  const fn = (...exprs) => {
    const fnEnv = new Env(env, ast.value[1], exprs);
    return EVAL(ast.value[2], fnEnv);
  };
  return new MalFunction(doForms, binds, env, fn);
};

const EVAL = (ast, env) => {
  while (true) {
    if (!(ast instanceof MalList)) {
      return eval_ast(ast, env);
    }

    if (ast.isEmpty()) {
      return ast;
    }

    switch (ast.value[0].value) {
      case "def!":
        return handleDef(ast, env);
      case "let*":
        [ast, env] = handleLet(ast, env);
        break;
      case "do":
        ast = handleDo(ast, env);
        break;
      case "if":
        ast = handleIf(ast, env);
        break;
      case "fn*":
        ast = handleFn(ast, env);
        break;
      default:
        const [fn, ...args] = eval_ast(ast, env).value;
        if (fn instanceof MalFunction) {
          ast = fn.value;
          const oldEnv = fn.env;
          const binds = fn.binds;
          env = new Env(oldEnv, binds, args);
        } else {
          return fn.apply(null, args);
        }
    }
  }
};

const PRINT = (str) => pr_str(str, true);

const rep = (str) => PRINT(EVAL(READ(str), env));

env.set(new MalSymbol("eval"), (ast) => EVAL(ast, env));
rep("(def! not (fn* (a) (if a false true)))");
rep(
  '(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\nnil)")))))'
);

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
