const { MalList } = require("./types");

class Env {
  #outer;
  constructor(outer, binds, exprs) {
    this.#outer = outer;
    this.data = {};
    this.bindExprs(binds, exprs);
  }

  bindExprs(binds, exprs) {
    if (!binds) {
      return;
    }

    const bindList = binds.value;
    for (let index = 0; index < bindList.length; index++) {
      if (bindList[index].value === "&") {
        console.log(exprs.slice(index));
        this.set(bindList[index + 1], new MalList(exprs.slice(index)));
        return;
      }
      this.set(bindList[index], exprs[index]);
    }
  }

  set(symbol, malValue) {
    this.data[symbol.value] = malValue;
  }

  find(symbol) {
    if (this.data[symbol.value] !== undefined) {
      return this;
    }

    if (this.#outer) {
      return this.#outer.find(symbol);
    }
  }

  get(symbol) {
    const env = this.find(symbol);
    if (!env) {
      throw `${symbol.value} not found`;
    }
    return env.data[symbol.value];
  }
}

module.exports = { Env };
