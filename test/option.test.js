/**
 * @file option.test.js
 * @copyright 2026 PlasticHeart
 *
 * Tests based on the examples in https://doc.rust-lang.org/std/option/enum.Option.html
 * Tuples are arrays and panics are thrown errors.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
    Some, None, Ok, Err, Option,
    ExpectError, FlattenError, TransposeError, UnwrapError, UnzipError,
    assertEq,
} from './helpers.js'

describe('Option', () => {
    it('is the base class of Some and None', () => {
        assert.ok(Some(1) instanceof Option)
        assert.ok(None() instanceof Option)
    })

    it('can be created with or without new', () => {
        assert.ok(new Some(1) instanceof Some)
        assert.ok(Some(1) instanceof Some)
        assert.ok(new None() instanceof None)
        assert.ok(None() instanceof None)
    })

    it('toString', () => {
        assert.equal(Some(2).toString(), 'Some(2)')
        assert.equal(None().toString(), 'None')
    })

    describe('toJSON', () => {
        it('Some', () => assert.equal(JSON.stringify(Some(2)), '2'))
        it('None', () => assert.equal(JSON.stringify(None()), 'null'))
        it('Some of object', () => assert.equal(JSON.stringify(Some({ a: 1 })), '{"a":1}'))
        it('Some of None', () => assert.equal(JSON.stringify(Some(None())), 'null'))
        it('Some of Some', () => assert.equal(JSON.stringify(Some(Some(1))), '1'))
        it('nested in object', () => {
            assert.equal(JSON.stringify({ a: Some(1), b: None() }), '{"a":1,"b":null}')
        })
        it('nested in array', () => assert.equal(JSON.stringify([Some(1), None(), 3]), '[1,null,3]'))
    })

    describe('and', () => {
        it('Some and None', () => assertEq(Some(2).and(None()), None()))
        it('None and Some', () => assertEq(None().and(Some('foo')), None()))
        it('Some and Some', () => assertEq(Some(2).and(Some('foo')), Some('foo')))
        it('None and None', () => assertEq(None().and(None()), None()))
    })

    describe('andThen', () => {
        const sqThenToString = x => x > 65535 ? None() : Some(String(x * x))

        it('Some', () => assertEq(Some(2).andThen(sqThenToString), Some('4')))
        it('Some to None', () => assertEq(Some(1_000_000).andThen(sqThenToString), None()))
        it('None', () => assertEq(None().andThen(sqThenToString), None()))
        it('does not call f on None', () => {
            None().andThen(() => assert.fail('called'))
        })
    })

    describe('expect', () => {
        it('Some', () => assert.equal(Some('value').expect('fruits are healthy'), 'value'))
        it('None throws ExpectError', () => {
            assert.throws(() => None().expect('fruits are healthy'), error => {
                assert.ok(error instanceof ExpectError)
                assert.equal(error.message, 'fruits are healthy')
                return true
            })
        })
    })

    describe('filter', () => {
        const isOdd = n => n % 2 === 1

        it('None', () => assertEq(None().filter(isOdd), None()))
        it('Some matching', () => assertEq(Some(3).filter(isOdd), Some(3)))
        it('Some not matching', () => assertEq(Some(4).filter(isOdd), None()))
        it('does not call predicate on None', () => {
            None().filter(() => assert.fail('called'))
        })
    })

    describe('flatten', () => {
        it('Some(Some)', () => assertEq(Some(Some(6)).flatten(), Some(6)))
        it('Some(None)', () => assertEq(Some(None()).flatten(), None()))
        it('None', () => assertEq(None().flatten(), None()))
        it('removes one level only', () => {
            assertEq(Some(Some(Some(6))).flatten(), Some(Some(6)))
            assertEq(Some(Some(Some(6))).flatten().flatten(), Some(6))
        })
        it('Some of non-Option throws FlattenError', () => {
            assert.throws(() => Some(6).flatten(), FlattenError)
        })
    })

    describe('isNone / isSome', () => {
        it('Some', () => {
            assert.equal(Some(2).isSome, true)
            assert.equal(Some(2).isNone, false)
        })
        it('None', () => {
            assert.equal(None().isSome, false)
            assert.equal(None().isNone, true)
        })
    })

    describe('isNoneOr', () => {
        it('Some matching', () => assert.equal(Some(2).isNoneOr(x => x > 1), true))
        it('Some not matching', () => assert.equal(Some(0).isNoneOr(x => x > 1), false))
        it('None', () => assert.equal(None().isNoneOr(x => x > 1), true))
        it('does not call f on None', () => {
            None().isNoneOr(() => assert.fail('called'))
        })
    })

    describe('isSomeAnd', () => {
        it('Some matching', () => assert.equal(Some(2).isSomeAnd(x => x > 1), true))
        it('Some not matching', () => assert.equal(Some(0).isSomeAnd(x => x > 1), false))
        it('None', () => assert.equal(None().isSomeAnd(x => x > 1), false))
        it('does not call f on None', () => {
            None().isSomeAnd(() => assert.fail('called'))
        })
    })

    describe('map', () => {
        it('Some', () => assertEq(Some('Hello, World!').map(s => s.length), Some(13)))
        it('None', () => assertEq(None().map(s => s.length), None()))
        it('does not call f on None', () => {
            None().map(() => assert.fail('called'))
        })
    })

    describe('mapOr', () => {
        it('Some', () => assert.equal(Some('foo').mapOr(42, s => s.length), 3))
        it('None', () => assert.equal(None().mapOr(42, s => s.length), 42))
    })

    describe('mapOrElse', () => {
        const k = 21

        it('Some', () => assert.equal(Some('bar').mapOrElse(() => 2 * k, s => s.length), 3))
        it('None', () => assert.equal(None().mapOrElse(() => 2 * k, s => s.length), 42))
        it('does not call default on Some', () => {
            Some('bar').mapOrElse(() => assert.fail('called'), s => s.length)
        })
    })

    describe('okOr', () => {
        it('Some', () => assertEq(Some('foo').okOr(0), Ok('foo')))
        it('None', () => assertEq(None().okOr(0), Err(0)))
    })

    describe('okOrElse', () => {
        it('Some', () => assertEq(Some('foo').okOrElse(() => 0), Ok('foo')))
        it('None', () => assertEq(None().okOrElse(() => 0), Err(0)))
        it('does not call f on Some', () => {
            Some('foo').okOrElse(() => assert.fail('called'))
        })
    })

    describe('or', () => {
        it('Some or None', () => assertEq(Some(2).or(None()), Some(2)))
        it('None or Some', () => assertEq(None().or(Some(100)), Some(100)))
        it('Some or Some', () => assertEq(Some(2).or(Some(100)), Some(2)))
        it('None or None', () => assertEq(None().or(None()), None()))
    })

    describe('orElse', () => {
        const nobody = () => None()
        const vikings = () => Some('vikings')

        it('Some', () => assertEq(Some('barbarians').orElse(vikings), Some('barbarians')))
        it('None to Some', () => assertEq(None().orElse(vikings), Some('vikings')))
        it('None to None', () => assertEq(None().orElse(nobody), None()))
        it('does not call f on Some', () => {
            Some(1).orElse(() => assert.fail('called'))
        })
    })

    describe('transpose', () => {
        it('Some(Ok)', () => assertEq(Some(Ok(5)).transpose(), Ok(Some(5))))
        it('Some(Err)', () => assertEq(Some(Err('e')).transpose(), Err('e')))
        it('None', () => assertEq(None().transpose(), Ok(None())))
        it('Some of non-Result throws TransposeError', () => {
            assert.throws(() => Some(5).transpose(), TransposeError)
        })
    })

    describe('unwrap', () => {
        it('Some', () => assert.equal(Some('air').unwrap(), 'air'))
        it('None throws UnwrapError', () => {
            assert.throws(() => None().unwrap(), UnwrapError)
        })
    })

    describe('unwrapOr', () => {
        it('Some', () => assert.equal(Some('car').unwrapOr('bike'), 'car'))
        it('None', () => assert.equal(None().unwrapOr('bike'), 'bike'))
    })

    describe('unwrapOrElse', () => {
        const k = 10

        it('Some', () => assert.equal(Some(4).unwrapOrElse(() => 2 * k), 4))
        it('None', () => assert.equal(None().unwrapOrElse(() => 2 * k), 20))
        it('does not call f on Some', () => {
            Some(4).unwrapOrElse(() => assert.fail('called'))
        })
    })

    describe('xor', () => {
        it('Some xor None', () => assertEq(Some(2).xor(None()), Some(2)))
        it('None xor Some', () => assertEq(None().xor(Some(2)), Some(2)))
        it('Some xor Some', () => assertEq(Some(2).xor(Some(2)), None()))
        it('None xor None', () => assertEq(None().xor(None()), None()))
    })

    describe('zip', () => {
        it('Some and Some', () => assertEq(Some(1).zip(Some('hi')), Some([1, 'hi'])))
        it('Some and None', () => assertEq(Some(1).zip(None()), None()))
        it('None and Some', () => assertEq(None().zip(Some(1)), None()))
        it('None and None', () => assertEq(None().zip(None()), None()))
    })

    describe('unzip', () => {
        it('Some', () => assertEq(Some([1, 'hi']).unzip(), [Some(1), Some('hi')]))
        it('None', () => assertEq(None().unzip(), [None(), None()]))
        it('Some of non-array throws UnzipError', () => {
            assert.throws(() => Some(1).unzip(), UnzipError)
        })
        it('Some of non-pair array throws UnzipError', () => {
            assert.throws(() => Some([1]).unzip(), UnzipError)
            assert.throws(() => Some([1, 'hi', true]).unzip(), UnzipError)
        })
    })
})
