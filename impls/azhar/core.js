const { pr_str } = require("./printer");
const { MalSymbol, MalValue, MalList, MalNil } = require("./types");

const isEqual = (item1, item2) => {
  if (
    Array.isArray(item1) &&
    Array.isArray(item2) &&
    item1.length === item2.length
  ) {
    return item1.every((x, i) => {
      if (x instanceof MalValue && item2[i] instanceof MalValue) {
        return x.equals(item2[i]);
      }
      return x === item2[i];
    });
  }

  return item1 === item2;
};

const ns = {
  "+": (...args) => args.reduce((a, b) => new MalValue(a.value + b.value)),
  "-": (...args) => args.reduce((a, b) => new MalValue(a.value - b.value)),
  "*": (...args) => args.reduce((a, b) => new MalValue(a.value * b.value)),
  "/": (...args) => args.reduce((a, b) => new MalValue(a.value / b.value)),
  "=": (...args) =>
    args.slice(0, -1).every((el, i) => isEqual(el.value, args[i + 1].value)),
  ">": (...args) =>
    args.slice(0, -1).every((el, i) => el.value > args[i + 1].value),
  "<": (...args) =>
    args.slice(0, -1).every((el, i) => el.value < args[i + 1].value),
  ">=": (...args) =>
    args.slice(0, -1).every((el, i) => el.value >= args[i + 1].value),
  "<=": (...args) =>
    args.slice(0, -1).every((el, i) => el.value <= args[i + 1].value),

  list: (...args) => new MalList(args),
  "list?": (args) => args instanceof MalList,
  count: (args) => new MalSymbol(args.length()),
  "empty?": (args) => args.length() === 0,
  prn: (...args) => {
    const out = args.map((el) => pr_str(el));
    console.log(out.join(" "));
    return new MalNil();
  },
  "pr-str": (...args) => args.map(pr_str).join(""),
};

module.exports = { ns };
