/**
 * Library for representing the `Result` of a computation that may fail. Which
 * is a more type friendly way to handle errors than exceptions.
 */

import {Maybe} from "maybe.ts"

/**
 * `Result<x, a>` implements `Methods<x, a>` interface that just provides a
 * method chaining based API for all of the exported functions.
 * @param x Represents type of the `error` for failed results.
 * @param a Represents type of the `value` for suceeded results.
 */
export class Methods<x, a> {
  /**
   * Applies given `f` function `this` result. If the this result is
   * `Ok` underlaying value will be mapped. If the result is an
   * `Error`, the same error value will propagate through.
   * 
   * ```ts
   * Result.ok(3).map(x => x + 1) // => Result.ok(4)
   * Result.error('bad input').map(x => x + 1) // => Result.error('bad input')
   * ```
   */
  map<b>(this: Result<x, a>, f: (value: a) => b): Result<x, b> {
    return map(f, this)
  }
  format<y>(this: Result<x, a>, f: (error: x) => y): Result<y, a> {
    return format(f, this)
  }
  chain<b>(this: Result<x, a>, next: (value: a) => Result<x, b>): Result<x, b> {
    return chain(next, this)
  }
  capture<y>(this: Result<x, a>, next: (error: x) => Result<y, a>): Result<y, a> {
    return capture(next, this)
  }
  recover(this: Result<x, a>, f: (error: x) => a): Result<x, a> {
    return recover(f, this)
  }
  and<b>(this: Result<x, a>, result: Result<x, b>): Result<x, b> {
    return and(this, result)
  }
  or<y>(this: Result<x, a>, result: Result<y, a>): Result<y, a> {
    return or(this, result)
  }
  toValue(this: Result<x, a>, fallback: a): a {
    return toValue(this, fallback)
  }
  toMaybe(this: Result<x, a>): Maybe<a> {
    return toMaybe(this)
  }
}

/**
 * Represents succeeded result and contains result `value`.
 * @param a type of the `value` for this result.
 */
export class Ok<a> extends Methods<any, a> {
  /**
   * Sentinel property for diferentitating between `Ok` and `Error` results.
   */
  isOk: true
  /**
   * @param value Success value of this result.
   */
  constructor(public value: a) {
    super()
  }
}

/**
 * Represents failer result and contains result `error`.
 * @param x type of the `error` value for failed result.
 */
export class Error<x> extends Methods<x, any> {
  /**
   * Sentinel property for diferentitating between `Ok` and `Error` results.
   */
  isOk: false
  /**
   * @param error Error value of this result.
   */
  constructor(public error: x) {
    super()
  }
}

/**
 * `Result<x, a>` is the type used for returning and propagating errors.
 * It is either `Ok<a>`, representing success and containing a value of type
 * `a`, or an `Error<x>`, representing failure and containing an error value
 * of type `x`.
 */
export type Result<x, a> =
  | Ok<a> & Methods<x, a>
  | Error<x> & Methods<x, a>


export const ok = <a>(value: a): Result<any, a> =>
  new Ok(value)

export const error = <x>(error: x): Result<x, any> =>
  new Error(error)

export const fromMaybe = <x, a>(error: x, value: Maybe<a>): Result<x, a> => {
  const result = value != null
    ? new Ok(value)
    : new Error(error)
  return result
}

export const chain =
  <x, a, b>(f: (value: a) => Result<x, b>, result: Result<x, a>): Result<x, b> =>
    result.isOk ? f(result.value) : result

export const capture =
  <x, y, a>(f: (error: x) => Result<y, a>, result: Result<x, a>): Result<y, a> =>
    result.isOk ? result : f(result.error)

export const recover =
  <x, a>(f: (error: x) => a, result: Result<x, a>): Result<x, a> =>
    result.isOk ? result : new Ok(f(result.error))

export const and =
  <x, a, b>(left: Result<x, a>, right: Result<x, b>): Result<x, b> =>
    left.isOk ? right : left

export const or =
  <x, y, a>(left: Result<x, a>, right: Result<y, a>): Result<y, a> =>
    left.isOk ? left : right

export const map =
  <x, a, b>(f: (value: a) => b, result: Result<x, a>): Result<x, b> =>
    result.isOk ? new Ok(f(result.value)) : result

export const format =
  <x, y, a>(f: (error: x) => y, result: Result<x, a>): Result<y, a> =>
    result.isOk ? result : new Error(f(result.error))

export const toValue =
  <x, a>(result: Result<x, a>, fallback: a): a =>
    result.isOk ? result.value : fallback

export const toMaybe =
  <x, a>(result: Result<x, a>): Maybe<a> =>
    result.isOk ? result.value : null

export const isOk = <x, a>(result: Result<x, a>): result is Ok<a> =>
  result.isOk

export const isError = <x, a>(result: Result<x, a>): result is Error<x> =>
  !result.isOk