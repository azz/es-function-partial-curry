# EcmaScript `partial` and `curry`

This proposal offers two popular functional programming features for EcmaScript,
partial application and currying.

## Provisions

Two functions are added to the standard API from `Function.prototype`:

  - `Function.prototype.partial` - Which returns another function with arguments pre-bound.
  - `Function.prototype.curry` - Which, like `partial` returns another function, but invoking the returned function will bind further arguments to the function. Invoking a curried function with no arguments causes the underlying function to be called.

## API

`Function.prototype.partial(...args)` - Yields a regular function with arguments bound.

`Function.prototype.curry(...args)` - Yields a "curried" function, which will continue to accept argument bindings with subsequent calls. To invoke a curried function, call it with no arguments.

## Examples

Basic partial application:

```js
function clamp(lower, upper, value) {
  if (value > upper) return upper;
  if (value < lower) return lower;
  return value;
}

const zeroToOne = clamp.partial(0.0, 1.0);
zeroToOne(1.5); //=> 1.0
```

Repeated currying with `reduce`:

```js
function sum(a, b) { return a + b; }

function immutableSetPropertyToSum(key, ...vals) {
  return {
    ...this,
    [key]: vals.reduce(sum, 0)
  };
}

const setFoo = immutableSetPropertyToSum.curry("foo");
const call = (fn, arg) => fn(arg);
const setFooToVal = [1, 2, 3].reduce(call, setFoo);
// Same as `() => immutableSetPropertyToSum("foo", 1, 2, 3)`

const obj = { foo: 0, bar: 1 };

obj::setFooToVal(); //=> { foo: 6, bar: 1 }
// Equivalent to `setFooToVal.call(obj)`

obj; //=> { foo: 0, bar: 1 }
```

The above demonstrates that `this` can be bound _after_ a partial or curried function is created.

Usage with `class`es:

```js
class ImmutablePoint {
  constructor(x=0, y=0) {
    this.x = x;
    this.y = y;
  }
  translated(dX, dY) {
    return new ImmutablePoint(this.x + dX, this.y + dY);
  }
}

const origin = new ImmutablePoint;
const translate = (::origin.translated).curry();
// Same as `origin.translated.bind(origin).curry()`
const translateY = y => translate(0)(y)();
const translateX = x => translate(x)(0)();

let point = translateX(translateY(-1), 1); //=> x: 1, y: -1
```

## Notes

Note that a curried function will not invoke the underlying function until it is called with zero arguments. However a partial function will be invoked unless `partial` is called again.

Thus, all of the following are semantically **equivalent**:

- `fn.curry()(1, 2, 3)()`
- `fn.curry(1, 2, 3)()`
- `fn.curry(1)(2)(3)()`
- `fn.curry(1, 2)(3)()`
- `fn.partial(1, 2, 3)()`
- `fn.partial(1).partial(2).partial(3)()`
- `fn.partial(1).partial(2)(3)`
- `fn.partial(1, 2).partial(3)()`
- `fn.partial(1, 2, 3)()`
- `fn.partial(1)(2, 3)`

`fn.partial()` (with no arguments) is essentially a no-op (but still produces a new closure).

## Binding `this`  

The recommended method of performing `this` binding with these functions is using the `::` operator.

`::fn.partial(1)(2)` is semantically the same as `fn.call(this, 1, 2)`.

One thing to note when using classes is that when calling a method, you will likely want to bind the function to the instance. This can be done, as shown above with `::instance.method`.

For example, a partial function could be `(::instance.method).partial(arg)`, this is **not** the same as `::instance.method.partial(arg)`.

The former yields `instance.method.bind(instance).partial(arg)`.

The latter yields
`instance.method.partial.call(instance.method, arg)`. Here, `this` becomes the method, not the instance.
