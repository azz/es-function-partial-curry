"use strict";

Function.prototype.partial = function (...bindArgs) {
  const fn = this;
  return function (...args) {
    return fn.call(this, ...bindArgs, ...args)
  }
}

Function.prototype.curry = function (...bindArgs) {
  const fn = this;
  return function (...args) {
    return args.length === 0
      ? fn.call(this, ...bindArgs)
      : fn.curry.call(fn, ...bindArgs, ...args);
  }
}
