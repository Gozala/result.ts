# `Result`

Library for representing the `Result` of a computation that may fail. Which is a type friendly alternative to handling errors than exceptions are.

## Usage


A `Result<x, a>` is either `Ok<a>` meaning the computation succeeded with `a` value, or it is an `Error<x>` meaning that there was some `x` failure.

```ts
type Result <x, a> =
  | { isOk:true, value: a }
  | { isOk:false, error:x }
```

Actual `Result<x, a>` interface is more complex as it provides all of the library functions as methods as well, but type signature above is a good summary.

### Import

All the examples above assume following import:

```ts
import * as Result from 'result.ts'
```

### Construct results


#### `Result.ok(value:a) => Result<x, a>`

Funciton `ok` constructs result of successful computaion:

```ts
Result.ok(5) // => {isOk:true, value:5}
```

#### `Result.error(error:x) => Result<x, a>`

Function `error` constructs a failed computation:

```ts
Result.ok('Oops!') // => {isOk:false, error:'Oops!'}
```

#### `Result.fromMaybe(error:x, value:void|null|undefined|a):Result<x, a>`

Convert from a `Maybe<a>` (which is `void|null|undefined|a`) to a result.

```ts
const parseInt = (input:string):null|number => {
  const value = Number.parseInt(input)
  if (Number.isNaN(value)) {
    return null
  } else {
    return value
  }
}

const readInt = (input:string):Result<string, number> =>
  Result.fromMaybe(`Input: "${input}" can not be read as an Int`,
                    parseInt(input))

readInt('5') // => Result.ok(5)
readInt('a') // => Result.error('Input: "a" can not be read as an Int')
```

P.S.: In the further examples we will make use of above defined `readInt`.


### Unbox results


#### `result.isOk:boolean`

You can use `isOk:boolean` common member to differentiate between `Ok<a>` and `Error<x>` possible instances of `Result<x,a>` and access to the corresponding properties:


```ts
const result = readInt(data)
if (result.isOk) {
  console.log(result.value + 15)
} else {
  console.error(result.error)
}
```

#### `result.isError:boolean`

For the symetry there is also `isError:boolean` common member:

```ts
const result = readInt(data)
if (result.isError) {
  console.error(result.error)
} else {
  console.log(result.value + 15)
}
```


#### `Result.isOk(result:Result<x, a>):boolean`

Library also provides [type predicate][type guards] as an alternative way to
narrow down the `Result<x, a>` to `Ok` or `Error`:

```ts
const result = readInt(data)
if (Result.isOk(result)) {
  console.log(result.value + 15)
} else {
  console.error(result.error)
}
```


#### `Result.isError(result:Result<x, a>):boolean`

For the symetry library also provides `Result.isError` [type predicate][type guards]:

```ts
const result = readInt(data)
if (Result.isError(resut)) {
  console.error(result.error)
} else {
  console.log(result.value + 15)
}
```

#### `<Result<x, a>>resut.toValue(fallback:a):a`

It is also possible unbox `Result<x, a>` by providing a `fallback:a` value in case result is a failed computation. 


```ts
readInt("123").toValue(0) // => 123
readInt("abc").toValue(0) // => 0
```

If the result is `Ok<a>` it returns the value, but if the result is an `Error` return a given fallback value.

#### `Result.toValue(result:Result<x, a>, fallback:a>):a`

Same API is also available as a function:

```ts
Result.toValue(readInt("123"), 0) // => 123
Result.toValue(readInt("abc"), 0) // => 0
```

#### `<Result<x, a>>result.toMaybe():null|a`

If actual error is not needed it is also possible to covert `Result<x, a>` to `Maybe<a>` (More specifically `undefined|null|void|a`):

```ts
readInt("123").toMaybe() // => 123
readInt("abc").toMaybe() // => null
```

#### `Result.toMaybe(result:Result<x, a>):null|a`

Same API is also available as a funciton:

```ts
Result.toMaybe(readInt("123")) // => 123
Result.toMaybe(readInt("abc")) // => null
```


### Transform results


#### `<Result<x, a>>result.map(f:(value:a) => b):Result<x, b>`

Applies a function to a `Result<x, a>`. If the result is `Ok` underlaying value will be mapped. If the result is an `Error`, the same error value will propagate through.

```ts
Result.ok(3).map(x => x + 1) // => Result.ok(4)
Result.error('bad input').map(x => x + 1) // => Result.error('bad input')
```

#### `Result.map(f:(value:a) => a, result:Result<x, a>):Result<x, a>`

Same API is also available as a function:

```ts
Result.map(x => x + 1, Result.ok(3)) // => ok(4)
Result.map(x => x + 1, Result.error('bad input')) // => error('bad input')
```

#### `<Result<x,a>>result.format(f:(error:x) => y):Result<y, a>`

It is also possible to map an `error` of the result. For example, say the errors we get have too much information:

```ts
Result
  .error({ reason:'Bad input', filename: '/path' })
  .format(error => error.reason) // => Result.error('Bad input')

Result
  .ok(4)
  .format(error => error.reason) // => Result.ok(4)
```

#### `Result.format(f:(error:x) => y, result:Result<x, a>):Result<y, a>`

Same API is also avaiable as a funciton:

```ts
Result.format(error => error.reason,
              Result.error({ reason:'Bad input', filename: '/path' }))
// => Result.error('Bad input')

Result.format(error => error.reason, Result.ok(4)) // => Result.ok(4)
```

#### `<Result<x, a>>result.format(f:(error:x) => a):Result<x, a>`

It is also possible to transform failed `Result<x, a>` to succeeded result by mapping `x` to `a`:

```ts
Result.error('Bad input').recover(Error) // => Result.ok(Error('Bad input'))
```

#### `Result.recover((error:x) => a, result:Result<x, a>):Result<x, a>`

Same API is also available as a function:

```ts
Result.recover(Error,
                Result.error('Bad Input')) // => Result.ok(Error('Bad Input'))
```

### Chaining results


#### `<Result<x, a>>result.chain(next:(value:a) => Result<x, b>):Result<x, b>`

It is possible to chain a sequence of computations that may fail:

```ts
type Month = 1|2|3|4|5|6|7|8|9|10|11|12
const toValidMonth = (n:number):Result<string, Month> => {
  if (n >= 1 && n <= 12 && Math.floor(n) === n) {
      return Result.ok(<Month>n)
  } else {
    return Result.error(`Number: ${n} is not with-in 0 to 12 month range`)
  }
}

const parseMonth = (input:string):Result<string, Month> =>
  readInt(input).chain(toValidMonth)

parseMonth('4') // => Result.ok(4)
parseMonth('a') // => Result.error('Input: "a" can not be read as an Int')
parseMonth('13') // => Result.error('Number 13 is not with-in 0 to 12 month range') 
```

#### `Result.chain(f:(value:a) => Result<x, b>, r:Result<x, a>):Result<x, b>`

Same API is also available as a function:

```ts
const parseMonth = (input:string):Result<string, Month> =>
  Result.chain(toValidMonth, readInt(input))

parseMonth('7') // => Result.ok(7)
parseMonth('Hi') // => Result.error('Input: "Hi" can not be read as an Int')
parseMonth('0') // => Result.error('Number: 0 is not with-in 0 to 12 month range')
```

#### `<Result<x, a>>result.and(other:Result<x, b>):Result<x, b>`

Sometimes you want to chain a sequence of computations, but unlike in previous example, result of next computation does not depend on result of previous one:

```ts
Result.ok(2).and(Result.error('late error')) // => Result.error('late error')
Result.error('early error').and(Result.ok(1)) // => Result.error('early error')

Result.error('early').and(Result.error('late')) // => Result.error('early')
Result.ok(2)
      .and(Result.ok('diff result type')) // => Result.ok('diff result type)
```

#### `Result.and(left:Result<x, a>, right:Result<x, b>):Result<x, b>`

Same API is available through a function as well:

```ts
{
const {ok, error} = Result
Result.and(ok(2), error('late error')) // => Result.error('late error')
Result.and(error('early error'), ok(1)) // => Result.error('early error')

Result.and(error('early'), error('late')) // => Result.error('early')
Result.and(ok(2), ok('diff result type')) // => Result.ok('diff result type)
}
```

#### `<Result<x, a>>result.capture(f:(error:x) => Result<y, a>):Result<y, a>`

It is also possible to chain a sequence of computations that may fail, such that next computation is performed when previous one fails:

```ts
const fromMonthName = (month:string):Month|null => {
  switch (month.toLowerCase()) {
    case "january": return 1
    case "february": return 2
    case "march": return 3
    case "april": return 4
    case "may": return 5
    case "june": return 6
    case "july": return 7
    case "august": return 8
    case "september": return 9
    case "october": return 10
    case "november": return 11
    case "december": return 12
    default: return null
  }
}

const readMonthByName = (input: string):Result<string, Month> =>
  Result.fromMaybe(`Input "${input}" is not a valid month name`,
                    fromMonthName(input))


const readMonth = (input:string):Result.Result<string, Month> =>
  parseMonth(input)
  .capture(intError =>
            readMonthByName(input)
            .format(nameError => `${intError} or ${nameError}`))

readMonth('3') // => Result.ok(3)
readMonth('June') // => Result.ok(6)
readMonth('17') // => Result.error('Input: 17 is not with-in 0 to 12 month range & Input "17" is not a valid month name')
readMonth('Jude') // Result.error('Input: "Jude" can not be read as an Int & Input: "Jude" is not a valid month name')
```

#### `Result.capture(f:(error:x) => Result<y, a>, r:Result<x, a>):Result<y, a>`


Same API is also available via function:

```ts
const readMonth = (input:string):Result.Result<string, Month> =>
  Result.caputer(badInt =>
                    readMonthByName(input).
                      format(badName => `${badInt} or ${badName}`),
                  parseMonth(input))

readMonth('3') // => Result.ok(3)
readMonth('June') // => Result.ok(6)
readMonth('17') // => Result.error('Input: 17 is not with-in 0 to 12 month range & Input "17" is not a valid month name')
readMonth('Jude') // Result.error('Input: "Jude" can not be read as an Int & Input: "Jude" is not a valid month name')
```

#### `<Result<x, a>>result.or(other:Result<y, a>):Result<y, a>`

It is also possible to chain a fallback computation that is performed if original fails, but unlike example above ignoring the first error:

```ts
{
const {ok, error} = Result

ok(2).or(error('late error')) // => Result.ok(2)
error('early error').or(ok(3)) // => Result.ok(3)
error(-1).or(error('diff result type'})) // => Result.error('diff result type')
ok(2).or(ok(100)) // => Result.ok(2)
}
```

#### `Result.or(left:Result<x, a>, right:Result<y, a>):Result<y, a>`

As in all other cases same API is availabel via function as well:

```ts
{
const {ok, error} = Result

Result.or(ok(2), error('late error')) // => Result.ok(2)
Result.or(error('early error'), ok(3)) // => Result.ok(3)
Result.or(error(-1), error('diff result type'})) // => Result.error('diff result type')
Result.or(ok(2), ok(100)) // => Result.ok(2)
}
```

## Prior Art

This library is inspired by:

- [Result from Elm][Result.elm]
- [Result from Rust][Result.rst]


[type guards]:https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
[Result.elm]:http://package.elm-lang.org/packages/elm-lang/core/latest/Result
[Result.rst]:https://doc.rust-lang.org/std/result/enum.Result.html