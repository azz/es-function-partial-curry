"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _context;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Function.prototype.partial = function () {
  for (var _len = arguments.length, bindArgs = Array(_len), _key = 0; _key < _len; _key++) {
    bindArgs[_key] = arguments[_key];
  }

  var fn = this;
  return function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return fn.call.apply(fn, [this].concat(bindArgs, args));
  };
};

Function.prototype.curry = function () {
  for (var _len3 = arguments.length, bindArgs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    bindArgs[_key3] = arguments[_key3];
  }

  var fn = this;
  return function () {
    var _fn$curry;

    for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    return args.length === 0 ? fn.call.apply(fn, [this].concat(bindArgs)) : (_fn$curry = fn.curry).call.apply(_fn$curry, [fn].concat(bindArgs, args));
  };
};
