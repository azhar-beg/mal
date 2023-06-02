const isEqual = (a, b) => {
  console.log(a, b, "======");
  if (a instanceof MalValue && b instanceof MalValue) {
    return a.equals(b);
  }
  return a === b;
};

const pr_str = (malValue) => {
  return malValue instanceof MalValue ? malValue.pr_str() : malValue;
};

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

  pr_str() {
    return `"` + this.value + `"`;
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
  constructor(ast, binds, env) {
    super(ast);
    this.binds = binds;
    this.env = env;
  }

  pr_str(printReadably) {
    return "#<function>";
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
};
