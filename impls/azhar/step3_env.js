const readline = require("readline");
const { read_str } = require("./reader.js");
const { pr_str } = require("./printer.js");

const {
  MalSymbol,
  MalList,
  MalValue,
  MalVector,
  MalHashMap,
} = require("./types.js");
const { Env } = require("./env.js");

const READ = (str) => read_str(str);

const _env = {
  "+": (...args) => args.reduce((a, b) => new MalValue(a.value + b.value)),
  "*": (...args) => args.reduce((a, b) => new MalValue(a.value * b.value)),
  "/": (...args) => args.reduce((a, b) => new MalValue(a.value / b.value)),
  "-": (...args) => args.reduce((a, b) => new MalValue(a.value - b.value)),
};

const env = new Env();
env.set(new MalSymbol("+"), (...args) =>
  args.reduce((a, b) => new MalValue(a.value + b.value))
);
env.set(new MalSymbol("*"), (...args) =>
  args.reduce((a, b) => new MalValue(a.value * b.value))
);
env.set(new MalSymbol("/"), (...args) =>
  args.reduce((a, b) => new MalValue(a.value / b.value))
);
env.set(new MalSymbol("-"), (...args) =>
  args.reduce((a, b) => new MalValue(a.value - b.value))
);

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
  }

  const [fn, ...args] = eval_ast(ast, env).value;
  return fn.apply(null, args);
};

const PRINT = (str) => pr_str(str);

const rep = (str) => PRINT(EVAL(READ(str), env));

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
