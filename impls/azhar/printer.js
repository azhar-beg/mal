const { MalValue } = require("./types");

// const literal = (str) => JSON.stringify(str);

const literal = (str) => {
  return str
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"')
    .replaceAll("\n", "\\\n");
};

const identity = (str) => str;

const pr_str = (malValue, print_readably = false) => {
  const format = print_readably ? literal : identity;

  return malValue instanceof MalValue
    ? format(malValue.pr_str())
    : format(malValue);
};

module.exports = { pr_str };
