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

Usage with immutable `class`es and lazy execution: ([Try in Babel REPL](https://babeljs.io/repl/#?experimental=true&evaluate=true&loose=false&spec=false&code=%22use%20strict%22%3B%0A%0AFunction.prototype.partial%20%3D%20function%20%28...bindArgs%29%20%7B%0A%20%20const%20fn%20%3D%20this%3B%0A%20%20return%20function%20%28...args%29%20%7B%0A%20%20%20%20return%20fn.call%28this%2C%20...bindArgs%2C%20...args%29%0A%20%20%7D%0A%7D%0A%0AFunction.prototype.curry%20%3D%20function%20%28...bindArgs%29%20%7B%0A%20%20const%20fn%20%3D%20this%3B%0A%20%20return%20function%20%28...args%29%20%7B%0A%20%20%20%20return%20args.length%20%3D%3D%3D%200%0A%20%20%20%20%20%20%3F%20fn.call%28this%2C%20...bindArgs%29%0A%20%20%20%20%20%20%3A%20fn.curry.call%28fn%2C%20...bindArgs%2C%20...args%29%3B%0A%20%20%7D%0A%7D%0A%0Aclass%20Stack%20%7B%0A%20%20constructor%28...vals%29%20%7B%0A%20%20%20%20this._list%20%3D%20%5B...vals%5D%3B%0A%20%20%7D%0A%20%20push%28...vals%29%20%7B%0A%20%20%20%20return%20new%20Stack%28...this._list%2C%20...vals%29%3B%0A%20%20%7D%0A%20%20%0A%20%20pop%28%29%20%7B%20return%20new%20Stack%28...this._list.slice%280%2C%20-1%29%29%3B%20%7D%0A%20%20top%28%29%20%7B%20return%20this._list.slice%28-1%29%3B%20%7D%0A%20%20%0A%20%20toString%28%29%20%7B%20return%20this._list.toString%28%29%3B%20%7D%0A%7D%0A%0Aconst%20stack%20%3D%20new%20Stack%281%2C%202%2C%203%29%3B%0A%0Afunction%20lazilyAddItems%28items%29%20%7B%0A%20%20if%20%28!items.length%29%20return%20this%3B%0A%20%20return%20this%28...items%29%3B%0A%7D%0A%0Aconst%20curriedPush%20%3D%20Stack.prototype.push.curry%28%29%0A%20%20%3A%3AlazilyAddItems%28%5B4%2C%205%2C%206%5D%29%0A%20%20%3A%3AlazilyAddItems%28%5B7%2C%208%2C%209%5D%29%3B%0A%0Aconst%20stack2%20%3D%20stack%3A%3AcurriedPush%28%29%3B%20%2F%2F%20late%20binding%20%28curried.call%28stack%29%29%0Aconsole.log%28stack2.toString%28%29%29%20%2F%2F%3D%3E%201%2C2%2C3%2C4%2C5%2C6%2C7%2C8%2C9%0A%0Aconst%20stack3%20%3D%20%28new%20Stack%29%3A%3AcurriedPush%28%29%3B%0Aconsole.log%28stack3.toString%28%29%29%20%2F%2F%3D%3E%204%2C5%2C6%2C7%2C8%2C9%0A%0Aconsole.log%28stack.toString%28%29%29%20%2F%2F%3D%3E%201%2C2%2C3%20%28immutable%29))

```js
class Stack {
  constructor(...vals) {
    this._list = [...vals];
  }
  push(...vals) {
    return new Stack(...this._list, ...vals);
  }

  pop() { return new Stack(...this._list.slice(0, -1)); }
  top() { return this._list.slice(-1); }

  toString() { return this._list.toString(); }
}

const stack = new Stack(1, 2, 3);

function lazilyAddItems(items) {
  if (!items.length) return this;
  return this(...items);
}

const curriedPush = Stack.prototype.push.curry()
  ::lazilyAddItems([4, 5, 6])
  ::lazilyAddItems([7, 8, 9]);

const stack2 = stack::curriedPush(); // late binding (curried.call(stack))
console.log(stack2.toString()) //=> 1,2,3,4,5,6,7,8,9

const stack3 = (new Stack)::curriedPush();
console.log(stack3.toString()) //=> 4,5,6,7,8,9

console.log(stack.toString()) //=> 1,2,3 (immutable)
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
