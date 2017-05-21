type Maybe <a> = void|null|undefined|a

export interface API <x, a> {
  map <b> (f:(value:a) => b):Result<x, b>
  format <y> (f:(error:x) => y):Result<y, a>
  chain <b> (next:(value:a) => Result<x, b>):Result<x, b>
  capture <y> (next:(error:x) => Result<y, a>):Result<y, a>
  recover (f:(error:x) => a):Result<x, a>
  and <b> (result:Result<x, b>):Result<x, b>
  or <y> (result:Result<y, a>):Result<y, a>
  toValue(fallback:a):a
  toMaybe():null|a
}

export interface Ok <x, a> extends API<x, a> {
  isOk:true
  isError:false
  value:a
}

export interface Error <x, a> extends API<x, a> {
  isOk:false
  isError:true
  error:x
}

export type Result <x, a> =
  | Ok<x, a>
  | Error<x, a>


class Success <x, a> implements Ok<x, a> {
  isOk:true = true
  isError:false = false
  constructor(public value:a) {
  }
  map <b> (f:(value:a) => b):Result<x, b> {
    return ok(f(this.value))
  }
  format <y> (_:(error:x) => y):Result<y, a> {
    return <Result<any, a>>this
  }
  chain <b> (then:(value:a) => Result<x, b>):Result<x, b> {
    return then(this.value)
  }
  capture <y> (_:(error:x) => Result<y, a>):Result<y, a> {
    return <Result<any, a>>this
  }
  recover (_:(error:x) => a):Result<x, a> {
    return <Result<any, a>>this
  }
  and <b> (result:Result<x, b>):Result<x, b> {
    return result
  }
  or <y> (_:Result<y, a>):Result<y, a> {
    return <Result<any, a>>this
  }
  toValue(_:a):a {
    return this.value
  }
  toMaybe():null|a {
    return this.value
  }
}

class Failure <x, a> implements Error<x, a> {
  isOk:false = false
  isError:true = true
  constructor(public error:x) {

  }
  map <b> (_:(value:a) => b):Result<x, b> {
    return <Result<x, any>> this
  }
  format <y> (f:(error:x) => y):Result<y, a> {
    return error(f(this.error))
  }
  chain <b> (_:(value:a) => Result<x, b>):Result<x, b> {
    return <Result<x, any>>this
  }
  capture <y> (next:(error:x) => Result<y, a>):Result<y, a> {
    return next(this.error)
  }
  recover (f:(error:x) => a):Result<x, a> {
    return ok(f(this.error))
  }
  and <b> (_:Result<x, b>):Result<x, b> {
    return <Result<x, any>>this
  }
  or <y> (result:Result<y, a>):Result<y, a> {
    return result
  }
  toValue(fallback:a):a {
    return fallback
  }
  toMaybe():null|a {
    return null
  }
}

export const ok = <a> (value:a):Result<any, a> =>
  new Success(value)

export const error = <x> (error:x):Result<x, any> =>
  new Failure(error)

export const fromMaybe = <x, a> (error:x, value:Maybe<a>):Result<x, a> => {
  const result = value != null
    ? <Ok<x, a>>new Success(value)
    : <Error<x, a>>new Failure(error)
  return result
}

export const chain =
  <x, a, b> (f:(value:a) => Result<x, b>, result:Result<x, a>):Result<x, b> =>
  result.chain(f)

export const capture =
  <x, y, a> (f:(error:x) => Result<y, a>, result:Result<x, a>):Result<y, a> =>
  result.capture(f)

export const recover =
  <x, a> (f:(error:x) => a, result:Result<x, a>):Result<x, a> =>
  result.recover(f)

export const and =
  <x, a, b> (left:Result<x, a>, right:Result<x, b>):Result<x, b> =>
  left.and(right)

export const or =
  <x, y, a> (left:Result<x, a>, right:Result<y, a>):Result<y, a> =>
  left.or(right)

export const map =
  <x, a, b> (f:(value:a) => b, result:Result<x, a>):Result<x, b> =>
  result.map(f)

export const format =
  <x, y, a> (f:(error:x) => y, result:Result<x, a>):Result<y, a> =>
  result.format(f)

export const toValue =
  <x, a> (result:Result<x, a>, fallback:a):a =>
  result.toValue(fallback)

export const toMaybe =
  <x, a> (result:Result<x, a>):null|a =>
  result.toMaybe()

export const isOk = <x, a> (result:Result<x, a>):result is Ok<x, a> =>
  result.isOk

export const isError = <x, a> (result:Result<x, a>):result is Error<x, a> =>
  result.isError