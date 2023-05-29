const {
  MalValue,
  MalList,
  MalSymbol,
  MalVector,
  MalNil,
  MalHashMap,
  MalString,
  MalKey,
} = require("./types");

class Reader {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  peek() {
    return this.tokens[this.position];
  }

  next() {
    const token = this.peek();
    this.position++;
    return token;
  }
}

const tokenize = (str) => {
  const re =
    /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;

  return [...str.matchAll(re)].map((x) => x[1]).slice(0, -1);
};

const read_seq = (reader, closingSymbol) => {
  reader.next();
  const ast = [];

  while (reader.peek() !== closingSymbol) {
    if (reader.peek() === undefined) {
      throw new Error("unbalanced");
    }

    ast.push(read_form(reader));
  }

  reader.next();

  return ast;
};

const read_list = (reader) => {
  return new MalList(read_seq(reader, ")"));
};

const read_vector = (reader) => {
  return new MalVector(read_seq(reader, "]"));
};

const read_hashMap = (reader) => {
  return new MalHashMap(read_seq(reader, "}"));
};

const read_atom = (reader) => {
  const token = reader.next();

  if (token.match(/^-?[0-9]+$/)) {
    return new MalValue(parseInt(token));
  }
  if (token === "true") {
    return true;
  }
  if (token === "false") {
    return false;
  }

  if (token === "nil") {
    return new MalNil();
  }

  if (token.startsWith('"')) {
    if (token.endsWith('"') && token.length > 1) {
      return new MalString(token);
    }
    throw new Error("unbalanced");
  }

  if (token.startsWith(":")) {
    return new MalKey(token);
  }

  return new MalSymbol(token);
};

const quoteFormat = (reader) => {
  const tokens = reader.tokens;

  return new Reader(["(", "quote", ...tokens.slice(1), ")"]);
};

const quasiQuoteFormat = (reader) => {
  const tokens = reader.tokens;
  return new Reader(["(", "quasiquote", ...tokens.slice(1), ")"]);
};

const unquoteFormat = (reader) => {
  const tokens = reader.tokens;
  const quote = tokens[0].includes("@") ? "splice-unquote" : "unquote";
  return new Reader(["(", quote, ...tokens.slice(1), ")"]);
};

const read_form = (reader) => {
  const token = reader.peek();
  switch (token[0]) {
    case "(":
      return read_list(reader);
    case "[":
      return read_vector(reader);
    case "{":
      return read_hashMap(reader);
    // case "'":
    //   return read_form(quoteFormat(reader));
    // case "~":
    //   return read_form(unquoteFormat(reader));
    // case "`":
    //   return read_form(quasiQuoteFormat(reader));
    default:
      return read_atom(reader);
  }
};

const read_str = (str) => {
  const tokens = tokenize(str);
  const reader = new Reader(tokens);
  return read_form(reader);
};

module.exports = { read_str };
