const readline = require("readline");

const READ = (str) => str;

const EVAL = (str) => str;

const PRINT = (str) => str;

const rep = (str) => PRINT(EVAL(READ(str)));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const repl = () => {
  rl.question("user> ", (line) => {
    console.log(rep(line));
    repl();
  });
};

repl();
