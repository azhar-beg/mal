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

const isEqual = (a, b) => {
  if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
    return a.every((x, i) => {
      console.log(x, b[i]);
      if (x instanceof MalValue && b[i] instanceof MalValue) {
        return x.equals(b[i]);
      }
      return x === b[i];
    });
  }

  return a === b;
};

const READ = (str) => read_str(str);

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

env.set(new MalSymbol("prn"), (...args) => {
  const out = args.map((el) => el.value);
  console.log(out.join(" "));
});
env.set(new MalSymbol("="), (...args) =>
  args.slice(0, -1).every((el, i) => isEqual(el.value, args[i + 1].value))
);
env.set(new MalSymbol("list"), (...args) => new MalList(args));
env.set(new MalSymbol(">"), (...args) =>
  args.slice(0, -1).every((el, i) => el.value > args[i + 1].value)
);
env.set(new MalSymbol(">="), (...args) => {
  return args.slice(0, -1).every((el, i) => el.value >= args[i + 1].value);
});
env.set(new MalSymbol("<"), (...args) =>
  args.slice(0, -1).every((el, i) => el.value < args[i + 1].value)
);
env.set(new MalSymbol("<="), (...args) =>
  args.slice(0, -1).every((el, i) => el.value <= args[i + 1].value)
);

env.set(new MalSymbol("list?"), (args) => args instanceof MalList);

env.set(new MalSymbol("count"), (args) => {
  return new MalSymbol(args.length());
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

  const result = ["nil", false].includes(evaluatedCond)
    ? EVAL(secondExpr)
    : EVAL(firsExpr);

  return result;
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
  }

  const [fn, ...args] = eval_ast(ast, env).value;
  return fn.apply(null, args) ?? "nil";
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
