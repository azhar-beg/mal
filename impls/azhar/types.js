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

  pr_str() {
    return "(" + this.value.map((x) => pr_str(x)).join(" ") + ")";
  }

  isEmpty() {
    return this.value.length === 0;
  }
}

class MalVector extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return "[" + this.value.map((x) => pr_str(x)).join(" ") + "]";
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

class MalNil extends MalValue {
  constructor() {
    super(null);
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
};
