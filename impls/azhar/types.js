const pr_str = (malValue, print_readably = false) => {
  return malValue instanceof MalValue
    ? malValue.pr_str(print_readably)
    : malValue;
};

const createMalString = (str) => {
  const value = str.replace(/\\(.)/, (y, captured) =>
    captured === "n" ? "\n" : captured
  );

  return new MalString(value);
};

const isEqual = (a, b) => {
  if (a instanceof MalValue && b instanceof MalValue) {
    return a.equals(b);
  }
  return a === b;
};

// const pr_str = (malValue, print_readably) => {
//   return malValue instanceof MalValue ? malValue.pr_str() : malValue;
// };

class MalValue {
  constructor(value) {
    this.value = value;
  }

  pr_str() {
    return this.value.toString();
  }

  equals(b) {
    return this.value === b.value;
  }
}

class MalSymbol extends MalValue {
  constructor(value) {
    super(value);
  }
}

class MalString extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str(readability = false) {
    if (readability) {
      return (
        '"' +
        this.value
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n") +
        '"'
      );
    }

    return this.value.toString();
  }
}

class MalKey extends MalValue {
  constructor(value) {
    super(value);
  }
}

class MalList extends MalValue {
  constructor(value) {
    super(value);
  }

  length() {
    return this.value.length;
  }

  pr_str() {
    return "(" + this.value.map((x) => pr_str(x)).join(" ") + ")";
  }

  equals(b) {
    if (b instanceof MalList || b instanceof MalVector) {
      return this.value.every((x, i) => isEqual(x, b.value[i]));
    }
    return false;
  }

  isEmpty() {
    return this.value.length === 0;
  }
}

class MalVector extends MalValue {
  constructor(value) {
    super(value);
  }

  length() {
    return this.value.length;
  }

  equals(b) {
    console.log(b, "-----");
    if (b instanceof MalList || b instanceof MalVector) {
      return this.value.every((x, i) => isEqual(x, b.value[i]));
    }
    return false;
  }

  pr_str() {
    return "[" + this.value.map((x) => pr_str(x)).join(" ") + "]";
  }
}

class MalQuasiquote extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return "(quasiquote " + pr_str(this.value) + ")";
  }
}
class MalQuote extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return "(quote " + pr_str(this.value) + ")";
  }
}
class MalUnquote extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return "(unquote " + pr_str(this.value) + ")";
  }
}

class MalSpliceUnquote extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return "(splice-unquote " + pr_str(this.value) + ")";
  }
}

class MalHashMap extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return "{" + this.value.map((x) => pr_str(x)).join(" ") + "}";
  }
}

class MalFunction extends MalValue {
  constructor(ast, binds, env, fn) {
    super(ast);
    this.binds = binds;
    this.env = env;
    this.fn = fn;
  }

  pr_str(printReadably) {
    return "#<function>";
  }

  apply(ctx, args) {
    return this.fn.apply(ctx, args);
  }
}

class MalNil extends MalValue {
  constructor() {
    super(null);
  }

  length() {
    return 0;
  }

  pr_str() {
    return "nil";
  }
}

class MalAtom extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str(print_readably = false) {
    return "(atom " + pr_str(this.value, print_readably) + ")";
  }

  deref() {
    return this.value;
  }

  reset(value) {
    this.value = value;
    return this.value;
  }

  swap(f, args) {
    this.value = f.apply(null, [this.value, ...args]);
    return this.value;
  }
}

module.exports = {
  MalSymbol,
  MalValue,
  MalList,
  MalVector,
  MalNil,
  MalHashMap,
  MalString,
  MalKey,
  MalQuote,
  MalUnquote,
  MalQuasiquote,
  MalSpliceUnquote,
  MalFunction,
  MalAtom,
  createMalString,
  pr_str,
};
