import * as test from 'tape'
import * as Result from '..'

test('test API', test => {
  test.ok(isFunction(Result.ok))
  test.ok(isFunction(Result.isOk))
  test.ok(isFunction(Result.isError))
  test.ok(isFunction(Result.error))
  test.ok(isFunction(Result.fromMaybe))
  test.ok(isFunction(Result.map))
  test.ok(isFunction(Result.format))
  test.ok(isFunction(Result.chain))
  test.ok(isFunction(Result.capture))
  test.ok(isFunction(Result.recover))
  test.ok(isFunction(Result.and))
  test.ok(isFunction(Result.or))
  test.ok(isFunction(Result.toValue))
  test.ok(isFunction(Result.toMaybe))

  test.end()
})

test('test ok', test => {
  const {ok, error} = Result

  const success = ok(5)
  if (success.isOk) {
    test.equal(success.value, 5, `ok(5).value -> 5`)
  }


  test.equal(ok(5).isOk, true, `ok(5).isOk -> true`)



  test.equal(ok(3).toValue(4), 3, `ok(3).toValue(4) -> 3`)
  test.equal(ok(-4).toMaybe(), -4, `ok(-4).toMaybe() -> -4`)

  test.deepEqual(Result.fromMaybe('Oops', 3),
                  ok(3),
                  `Result.fromMaybe('Oops', 3) -> ok(3)`)
  test.deepEqual(ok(5).map($ => $ + 7),
                  ok(12),
                  `ok(5).map($ => $ + 7) -> ok(12)`)
  test.deepEqual(ok('great').format(Error),
                  ok('great'),
                  `ok('great').format(Error) -> ok('great')`)
  test.deepEqual(ok(Error('boom')).chain($ => ok($.message)),
                  ok('boom'),
                  `ok(Error('boom')).chain($ => ok($.message)) -> ok('boom')`)
  test.deepEqual(ok(Error('boom')).chain($ => error($.message)),
                  error('boom'),
                  `ok(Error('boom')).chain($ => error($.message)) -> error('boom')`)
  test.deepEqual(ok('beep').capture(_ => ok('bop')),
                  ok('beep'),
                  `ok('beep').capture(_ => ok('bop')) -> ok('beep')`)
  test.deepEqual(ok('beep').capture(_ => error('bop')),
                  ok('beep'),
                  `ok('beep').capture(_ => error('bop')) -> ok('beep')`)
  
test.deepEqual(ok('great').recover(JSON.stringify),
                  ok('great'),
                  `ok('great').recover(JSON.stringify) -> ok('great')`)
  test.deepEqual(ok(11).and(ok('foo')),
                  ok('foo'),
                  `ok(11).and(ok('foo')) -> ok('foo')`)
  test.deepEqual(ok(11).and(error('oops')),
                  error('oops'),
                  `ok(11).and(error('oops')) -> error('oops')`)
  test.deepEqual(ok(1).or(ok(7)),
                  ok(1),
                  'ok(1).or(ok(7)) -> ok(1)')
  test.deepEqual(ok(1).or(error('oops')),
                  ok(1),
                  `ok(1).or(error('oops')) -> ok(1)`)
  
  test.end()
})

test('test error', test => {
  const {ok, error} = Result

  const failure = error('Oops!')
  if (!failure.isOk) {
    test.equal(failure.error, 'Oops!', `error('Oops!').error -> 'Oops!'`)
  }

  test.equal(error(5).isOk, false, `error(5).isOk -> false`)
  test.equal(error(3).toValue(7),
              7,
              `error(3).toValue(7) -> 7`)
  test.equal(error(3).toValue('whatever'),
              'whatever',
              `error(3).toValue('whatever') -> 'whatever'`)
  test.equal(error(-4).toMaybe(), null, `error(-4).toMaybe() -> null`)

  test.deepEqual(Result.fromMaybe('Oops', null),
                  error('Oops'),
                  `Result.fromMaybe('Oops', null) -> error('Oops')`)

  test.deepEqual(Result.fromMaybe('Oops', undefined),
                  error('Oops'),
                  `Result.fromMaybe('Oops', null) -> error('Oops')`)

  test.deepEqual(Result.fromMaybe('Oops', (():void => {})()),
                  error('Oops'),
                  `Result.fromMaybe('Oops', (():void => {})()) -> error('Oops')`)

  test.deepEqual(error(5).map($ => $ + 7),
                  error(5),
                  `error(5).map($ => $ + 7) -> error(5)`)
  test.deepEqual(error('great').format(Error),
                  error(Error('great')),
                  `error('great').format(Error) -> error(Error('great'))`)
  test.deepEqual(error(Error('boom')).chain($ => ok($.message)),
                  error(Error('boom')),
                  `error(Error('boom')).chain($ => ok($.message)) -> error(Error('boom'))`)
  test.deepEqual(error(Error('boom')).chain($ => error($.message)),
                  error(Error('boom')),
                  `ok(Error('boom')).chain($ => error($.message)) -> error(Error('boom'))`)
  test.deepEqual(error('beep').capture(_ => ok('bop')),
                  ok('bop'),
                  `error('beep').capture(_ => ok('bop')) -> ok('bop')`)
  test.deepEqual(error('beep').capture(_ => error('bop')),
                  error('bop'),
                  `ok('beep').capture(_ => error('bop')) -> error('bop')`)
  test.deepEqual(error('great').recover(Error),
                  ok(Error('great')),
                  `ok('great').recover(Error) -> ok(Error('great'))`)
  test.deepEqual(error(11).and(ok('foo')),
                  error(11),
                  `error(11).and(ok('foo')) -> error(11)`)
  test.deepEqual(error(11).and(error(5)),
                  error(11),
                  `ok(11).and(error(5)) -> error(11)`)
  test.deepEqual(error(1).or(ok(7)),
                  ok(7),
                  `error(1).or(ok(7)) -> ok(7)`)
  test.deepEqual(error(1).or(error('oops')),
                  error('oops'),
                  `error(1).or(error('oops')) -> error('oops')`)
  
  test.end()
})

test('test functions', test => {
  const {ok, error} = Result

  const success = ok(5)
  if (Result.isOk(success)) {
    test.equal(success.value, 5, `ok(5).value -> 5`)
  }

  test.equal(Result.isOk(ok(5)), true, `Result.isOk(ok(5)) -> true`)
  test.equal(Result.isError(ok(5)), false, `Result.isError(ok(5)) -> false`)
  test.equal(Result.toValue(ok(3), 4), 3, `Result.toValue(ok(3), 4) -> 3`)
  test.equal(Result.toMaybe(ok(-4)), -4, `Result.toMaybe(ok(-4)) -> -4`)
  test.deepEqual(Result.map($ => $ + 7, ok(5)),
                  ok(12),
                  `Result.map($ => $ + 7, ok(5))`)
  test.deepEqual(Result.format(Error, ok('great')),
                  ok('great'),
                  `Result.format(Error, ok('great'))`)
  test.deepEqual(Result.chain($ => ok($.message), ok(Error('boom'))),
                  ok('boom'),
                  `Result.chain($ => ok($.message), ok(Error('boom'))) -> ok('boom')`)
  test.deepEqual(Result.chain($ => error($.message), ok(Error('boom'))),
                  error('boom'),
                  `Result.chain($ => error($.message), ok(Error('boom'))) -> error('boom')`)
  test.deepEqual(Result.capture(_ => ok('bop'), ok('beep')),
                  ok('beep'),
                  `Result.capture(_ => ok('bop'), ok('beep')) -> ok('beep')`)
  test.deepEqual(Result.capture(_ => error('bop'), ok('beep')),
                  ok('beep'),
                  `Result.capture(_ => error('bop'), ok('beep')) -> ok('beep')`)
  test.deepEqual(Result.recover(JSON.stringify, ok('great')),
                  ok('great'),
                  `Result.recover(JSON.stringify, ok('great'))`)
  test.deepEqual(Result.and(ok(11), ok('foo')),
                  ok('foo'),
                  `Result.and(ok(11), ok('foo')) -> ok('foo')`)
  test.deepEqual(Result.and(ok(11), error('oops')),
                  error('oops'),
                  `Result.and(ok(11), error('oops')) -> error('oops')`)
  test.deepEqual(Result.or(ok(1), ok(7)),
                  ok(1),
                  'Result.or(ok(1), ok(7)) -> ok(1)')
  test.deepEqual(Result.or(ok(1), error('oops')),
                  ok(1),
                  `Result.or(ok(1), error('oops')) -> ok(1)`)


  const failure = error('Oops!')
  if (Result.isError(failure)) {
    test.equal(failure.error, 'Oops!', `error('Oops!').error -> 'Oops!'`)
  }

  test.equal(Result.isOk(error(5)), false, `Result.isOk(error(5)) -> false`)
  test.equal(Result.isError(error(5)), true, `Result.isError(error(5)) -> true`)
  test.equal(Result.toValue(error(3), 7),
              7,
              `Result.toValue(error(3), 7) -> 7`)
  test.equal(Result.toValue(error(3), 'whatever'),
              'whatever',
              `Result.toValue(error(3), 'whatever') -> 'whatever'`)
  test.equal(Result.toMaybe(error(-4)),
              null,
              `Result.toMaybe(error(-4)) -> null`)
  test.deepEqual(Result.map($ => $ + 7, error(5)),
                  error(5),
                  `Result.map($ => $ + 7, error(5)) -> error(5)`)
  test.deepEqual(Result.format(Error, error('great')),
                  error(Error('great')),
                  `Result.format(Error, error('great')) -> error(Error('great'))`)
  test.deepEqual(Result.chain($ => ok($.message), error(Error('boom'))),
                  error(Error('boom')),
                  `Result.chain($ => ok($.message), error(Error('boom'))) -> error(Error('boom'))`)
  test.deepEqual(Result.chain($ => error($.message), error(Error('boom'))),
                  error(Error('boom')),
                  `Result.chain($ => error($.message), error(Error('boom'))) -> error(Error('boom'))`)
  test.deepEqual(Result.capture(_ => ok('bop'), error('beep')),
                  ok('bop'),
                  `Result.capture(_ => ok('bop'), error('beep')) -> ok('bop')`)
  test.deepEqual(Result.capture(_ => error('bop'), error('beep')),
                  error('bop'),
                  `Result.capture(_ => error('bop'), error('beep'))`)
  test.deepEqual(Result.recover(Error, error('great')),
                  ok(Error('great')),
                  `Result.recover(Error, error('great')) -> ok(Error('great'))`)
  test.deepEqual(Result.and(error(11), ok('foo')),
                  error(11),
                  `Result.and(error(11), ok('foo')) -> error(11)`)
  test.deepEqual(Result.and(error(11), error(5)),
                  error(11),
                  `Result.and(error(11), error(5)) -> error(11)`)
  test.deepEqual(Result.or(error(1), ok(7)),
                  ok(7),
                  `Result.or(error(1), ok(7)) -> ok(7)`)
  test.deepEqual(Result.or(error(1), error('oops')),
                  error('oops'),
                  `Result.or(error(1), error('oops')) -> error('oops')`)

  test.end()
})

const isFunction =
  (value:any) =>
  typeof value == 'function'