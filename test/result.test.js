/**
 * @file result.test.js
 * @copyright 2026 PlasticHeart
 *
 * Tests based on the examples in https://doc.rust-lang.org/std/result/enum.Result.html
 * Tuples are arrays and panics are thrown errors.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
    Some, None, Ok, Err, Result,
    ExpectError, FlattenError, TransposeError, UnwrapError,
    assertEq,
} from './helpers.js'

describe('Result', () => {
    it('is the base class of Ok and Err', () => {
        assert.ok(Ok(1) instanceof Result)
        assert.ok(Err(1) instanceof Result)
    })

    it('can be created with or without new', () => {
        assert.ok(new Ok(1) instanceof Ok)
        assert.ok(Ok(1) instanceof Ok)
        assert.ok(new Err(1) instanceof Err)
        assert.ok(Err(1) instanceof Err)
    })

    it('toString', () => {
        assert.equal(Ok(2).toString(), 'Ok(2)')
        assert.equal(Err('e').toString(), 'Err(e)')
    })

    describe('and', () => {
        it('Ok and Err', () => assertEq(Ok(2).and(Err('late error')), Err('late error')))
        it('Err and Ok', () => assertEq(Err('early error').and(Ok('foo')), Err('early error')))
        it('Err and Err', () => assertEq(Err('not a 2').and(Err('late error')), Err('not a 2')))
        it('Ok and Ok', () => assertEq(Ok(2).and(Ok('different result type')), Ok('different result type')))
    })

    describe('andThen', () => {
        const sqThenToString = x => x > 65535 ? Err('overflowed') : Ok(String(x * x))

        it('Ok', () => assertEq(Ok(2).andThen(sqThenToString), Ok('4')))
        it('Ok to Err', () => assertEq(Ok(1_000_000).andThen(sqThenToString), Err('overflowed')))
        it('Err', () => assertEq(Err('not a number').andThen(sqThenToString), Err('not a number')))
        it('does not call f on Err', () => {
            Err('e').andThen(() => assert.fail('called'))
        })
    })

    describe('err', () => {
        it('Ok', () => assertEq(Ok(2).err(), None()))
        it('Err', () => assertEq(Err('Nothing here').err(), Some('Nothing here')))
    })

    describe('expect', () => {
        it('Ok', () => assert.equal(Ok(2).expect('Testing expect'), 2))
        it('Err throws ExpectError', () => {
            assert.throws(() => Err('emergency failure').expect('Testing expect'), error => {
                assert.ok(error instanceof ExpectError)
                assert.equal(error.message, 'Testing expect: emergency failure')
                return true
            })
        })
    })

    describe('expectErr', () => {
        it('Err', () => assert.equal(Err('emergency failure').expectErr('Testing expectErr'), 'emergency failure'))
        it('Ok throws ExpectError', () => {
            assert.throws(() => Ok(10).expectErr('Testing expectErr'), error => {
                assert.ok(error instanceof ExpectError)
                assert.equal(error.message, 'Testing expectErr: 10')
                return true
            })
        })
    })

    describe('flatten', () => {
        it('Ok(Ok)', () => assertEq(Ok(Ok('hello')).flatten(), Ok('hello')))
        it('Ok(Err)', () => assertEq(Ok(Err(6)).flatten(), Err(6)))
        it('Err', () => assertEq(Err(6).flatten(), Err(6)))
        it('removes one level only', () => {
            assertEq(Ok(Ok(Ok(6))).flatten(), Ok(Ok(6)))
            assertEq(Ok(Ok(Ok(6))).flatten().flatten(), Ok(6))
        })
        it('Ok of non-Result throws FlattenError', () => {
            assert.throws(() => Ok(6).flatten(), FlattenError)
        })
    })

    describe('inspect', () => {
        it('calls f with the value on Ok and returns the result', () => {
            const seen = []
            const returned = Ok(4).inspect(x => seen.push(x))
            assert.deepEqual(seen, [4])
            assertEq(returned, Ok(4))
        })
        it('does not call f on Err', () => {
            const returned = Err('e').inspect(() => assert.fail('called'))
            assertEq(returned, Err('e'))
        })
        it('can be chained', () => {
            const seen = []
            const x = Ok(4).inspect(x => seen.push(x)).map(x => x ** 3).expect('failed to parse number')
            assert.deepEqual(seen, [4])
            assert.equal(x, 64)
        })
    })

    describe('inspectErr', () => {
        it('calls f with the error on Err and returns the result', () => {
            const seen = []
            const returned = Err('e').inspectErr(e => seen.push(e))
            assert.deepEqual(seen, ['e'])
            assertEq(returned, Err('e'))
        })
        it('does not call f on Ok', () => {
            const returned = Ok(4).inspectErr(() => assert.fail('called'))
            assertEq(returned, Ok(4))
        })
    })

    describe('isOk / isErr', () => {
        it('Ok', () => {
            assert.equal(Ok(-3).isOk, true)
            assert.equal(Ok(-3).isErr, false)
        })
        it('Err', () => {
            assert.equal(Err('Some error message').isOk, false)
            assert.equal(Err('Some error message').isErr, true)
        })
    })

    describe('isOkAnd', () => {
        it('Ok matching', () => assert.equal(Ok(2).isOkAnd(x => x > 1), true))
        it('Ok not matching', () => assert.equal(Ok(0).isOkAnd(x => x > 1), false))
        it('Err', () => assert.equal(Err('hey').isOkAnd(x => x > 1), false))
        it('does not call f on Err', () => {
            Err('hey').isOkAnd(() => assert.fail('called'))
        })
    })

    describe('isErrAnd', () => {
        const NOT_FOUND = 'NotFound'
        const PERMISSION_DENIED = 'PermissionDenied'

        it('Err matching', () => assert.equal(Err(NOT_FOUND).isErrAnd(e => e === NOT_FOUND), true))
        it('Err not matching', () => assert.equal(Err(PERMISSION_DENIED).isErrAnd(e => e === NOT_FOUND), false))
        it('Ok', () => assert.equal(Ok(123).isErrAnd(e => e === NOT_FOUND), false))
        it('does not call f on Ok', () => {
            Ok(123).isErrAnd(() => assert.fail('called'))
        })
    })

    describe('map', () => {
        it('Ok', () => assertEq(Ok(4).map(x => x * 2), Ok(8)))
        it('Err', () => assertEq(Err('e').map(x => x * 2), Err('e')))
        it('does not call f on Err', () => {
            Err('e').map(() => assert.fail('called'))
        })
    })

    describe('mapErr', () => {
        const stringify = x => `error code: ${x}`

        it('Ok', () => assertEq(Ok(2).mapErr(stringify), Ok(2)))
        it('Err', () => assertEq(Err(13).mapErr(stringify), Err('error code: 13')))
        it('does not call f on Ok', () => {
            Ok(2).mapErr(() => assert.fail('called'))
        })
    })

    describe('mapOr', () => {
        it('Ok', () => assert.equal(Ok('foo').mapOr(42, s => s.length), 3))
        it('Err', () => assert.equal(Err('bar').mapOr(42, s => s.length), 42))
    })

    describe('mapOrElse', () => {
        const k = 21

        it('Ok', () => assert.equal(Ok('foo').mapOrElse(_e => k * 2, v => v.length), 3))
        it('Err', () => assert.equal(Err('bar').mapOrElse(_e => k * 2, v => v.length), 42))
        it('passes the error to default on Err', () => {
            assert.equal(Err('bar').mapOrElse(e => e.length, () => assert.fail('called')), 3)
        })
        it('does not call default on Ok', () => {
            Ok('foo').mapOrElse(() => assert.fail('called'), v => v.length)
        })
    })

    describe('ok', () => {
        it('Ok', () => assertEq(Ok(2).ok(), Some(2)))
        it('Err', () => assertEq(Err('Nothing here').ok(), None()))
    })

    describe('or', () => {
        it('Ok or Err', () => assertEq(Ok(2).or(Err('late error')), Ok(2)))
        it('Err or Ok', () => assertEq(Err('early error').or(Ok(2)), Ok(2)))
        it('Err or Err', () => assertEq(Err('not a 2').or(Err('late error')), Err('late error')))
        it('Ok or Ok', () => assertEq(Ok(2).or(Ok(100)), Ok(2)))
    })

    describe('orElse', () => {
        const sq = x => Ok(x * x)
        const err = x => Err(x)

        it('Ok to Ok', () => assertEq(Ok(2).orElse(sq).orElse(sq), Ok(2)))
        it('Ok to Err', () => assertEq(Ok(2).orElse(err).orElse(sq), Ok(2)))
        it('Err to Ok', () => assertEq(Err(3).orElse(sq).orElse(err), Ok(9)))
        it('Err to Err', () => assertEq(Err(3).orElse(err).orElse(err), Err(3)))
        it('does not call f on Ok', () => {
            Ok(2).orElse(() => assert.fail('called'))
        })
    })

    describe('transpose', () => {
        it('Ok(Some)', () => assertEq(Ok(Some(5)).transpose(), Some(Ok(5))))
        it('Ok(None)', () => assertEq(Ok(None()).transpose(), None()))
        it('Err', () => assertEq(Err('e').transpose(), Some(Err('e'))))
        it('Ok of non-Option throws TransposeError', () => {
            assert.throws(() => Ok(5).transpose(), TransposeError)
        })
    })

    describe('unwrap', () => {
        it('Ok', () => assert.equal(Ok(2).unwrap(), 2))
        it('Err throws UnwrapError', () => {
            assert.throws(() => Err('emergency failure').unwrap(), UnwrapError)
        })
    })

    describe('unwrapErr', () => {
        it('Err', () => assert.equal(Err('emergency failure').unwrapErr(), 'emergency failure'))
        it('Ok throws UnwrapError', () => {
            assert.throws(() => Ok(2).unwrapErr(), UnwrapError)
        })
    })

    describe('unwrapOr', () => {
        const fallback = 2

        it('Ok', () => assert.equal(Ok(9).unwrapOr(fallback), 9))
        it('Err', () => assert.equal(Err('error').unwrapOr(fallback), 2))
    })

    describe('unwrapOrElse', () => {
        const count = x => x.length

        it('Ok', () => assert.equal(Ok(2).unwrapOrElse(count), 2))
        it('Err', () => assert.equal(Err('foo').unwrapOrElse(count), 3))
        it('does not call f on Ok', () => {
            Ok(2).unwrapOrElse(() => assert.fail('called'))
        })
    })
})
