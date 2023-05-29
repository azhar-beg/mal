const { MalValue } = require("./types");

const pr_str = (malValue) => {
  return malValue instanceof MalValue ? malValue.pr_str() : malValue;
};

module.exports = { pr_str };
