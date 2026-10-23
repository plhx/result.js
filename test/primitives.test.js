/**
 * @file primitives.test.js
 * @copyright 2026 PlasticHeart
 *
 * Tests for the methods added to Boolean, Number, Array, Set and Map.
 * Comparison methods follow Rust's PartialEq / Ord: equals returns a boolean,
 * compare returns a negative, zero or positive number (NaN when the values are not comparable).
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Some, None, Unit, assertEq } from './helpers.js'

describe('Boolean', () => {
    describe('equals', () => {
        it('same value', () => {
            assert.equal(true.equals(true), true)
            assert.equal(false.equals(false), true)
        })
        it('different value', () => {
            assert.equal(true.equals(false), false)
            assert.equal(false.equals(true), false)
        })
        it('non-boolean', () => {
            assert.equal(true.equals(1), false)
            assert.equal(false.equals(0), false)
        })
    })

    describe('compare', () => {
        it('false < true', () => assert.equal(Math.sign(false.compare(true)), -1))
        it('true > false', () => assert.equal(Math.sign(true.compare(false)), 1))
        it('equal', () => {
            assert.equal(true.compare(true), 0)
            assert.equal(false.compare(false), 0)
        })
        it('non-boolean', () => assert.ok(Number.isNaN(true.compare(1))))
    })

    describe('okOr', () => {
        it('true', () => {
            const result = true.okOr('error')
            assert.equal(result.isOk, true)
            assert.ok(result.unwrap() instanceof Unit)
        })
        it('false', () => {
            const result = false.okOr('error')
            assert.equal(result.isErr, true)
            assert.equal(result.unwrapErr(), 'error')
        })
    })

    describe('okOrElse', () => {
        it('true', () => {
            const result = true.okOrElse(() => assert.fail('called'))
            assert.equal(result.isOk, true)
            assert.ok(result.unwrap() instanceof Unit)
        })
        it('false', () => {
            const result = false.okOrElse(() => 'error')
            assert.equal(result.isErr, true)
            assert.equal(result.unwrapErr(), 'error')
        })
    })

    describe('then', () => {
        it('true', () => assertEq(true.then(() => 5), Some(5)))
        it('false', () => assertEq(false.then(() => 5), None()))
        it('does not call f on false', () => {
            false.then(() => assert.fail('called'))
        })
    })

    describe('thenSome', () => {
        it('true', () => assertEq(true.thenSome(5), Some(5)))
        it('false', () => assertEq(false.thenSome(5), None()))
    })
})

describe('Number', () => {
    describe('equals', () => {
        it('same value', () => assert.equal((1).equals(1), true))
        it('different value', () => assert.equal((1).equals(2), false))
        it('non-number', () => assert.equal((1).equals('1'), false))
    })

    describe('compare', () => {
        it('less', () => assert.equal(Math.sign((1).compare(2)), -1))
        it('greater', () => assert.equal(Math.sign((2).compare(1)), 1))
        it('equal', () => assert.equal((1).compare(1), 0))
        it('non-number', () => assert.ok(Number.isNaN((1).compare('1'))))
    })
})

describe('Array', () => {
    describe('equals', () => {
        it('same elements', () => assert.equal([1, 2, 3].equals([1, 2, 3]), true))
        it('empty', () => assert.equal([].equals([]), true))
        it('different element', () => assert.equal([1, 2, 3].equals([1, 2, 4]), false))
        it('different length', () => {
            assert.equal([1, 2].equals([1, 2, 3]), false)
            assert.equal([1, 2, 3].equals([1, 2]), false)
        })
        it('nested', () => {
            assert.equal([[1], [2, 3]].equals([[1], [2, 3]]), true)
            assert.equal([[1], [2, 3]].equals([[1], [2, 4]]), false)
        })
        it('non-array', () => assert.equal([1].equals(1), false))
    })

    describe('compare', () => {
        it('equal', () => assert.equal([1, 2].compare([1, 2]), 0))
        it('empty', () => assert.equal([].compare([]), 0))
        it('less', () => assert.equal(Math.sign([1, 2].compare([1, 3])), -1))
        it('greater', () => assert.equal(Math.sign([1, 3].compare([1, 2])), 1))
        it('decided by the first difference', () => assert.equal(Math.sign([1, 9].compare([2, 0])), -1))
        it('non-array', () => assert.ok(Number.isNaN([1].compare(1))))
    })
})

describe('Set', () => {
    describe('equals', () => {
        it('same elements', () => assert.equal(new Set([1, 2]).equals(new Set([1, 2])), true))
        it('different order', () => assert.equal(new Set([1, 2]).equals(new Set([2, 1])), true))
        it('empty', () => assert.equal(new Set().equals(new Set()), true))
        it('different element', () => assert.equal(new Set([1, 2]).equals(new Set([1, 3])), false))
        it('different size', () => {
            assert.equal(new Set([1, 2]).equals(new Set([1])), false)
            assert.equal(new Set([1]).equals(new Set([1, 2])), false)
        })
        it('non-set', () => assert.equal(new Set([1]).equals([1]), false))
    })
})

describe('Map', () => {
    describe('equals', () => {
        it('same entries', () => assert.equal(new Map([['a', 1], ['b', 2]]).equals(new Map([['a', 1], ['b', 2]])), true))
        it('different order', () => assert.equal(new Map([['a', 1], ['b', 2]]).equals(new Map([['b', 2], ['a', 1]])), true))
        it('empty', () => assert.equal(new Map().equals(new Map()), true))
        it('different value', () => assert.equal(new Map([['a', 1]]).equals(new Map([['a', 2]])), false))
        it('different key', () => assert.equal(new Map([['a', 1]]).equals(new Map([['b', 1]])), false))
        it('different size', () => {
            assert.equal(new Map([['a', 1]]).equals(new Map([['a', 1], ['b', 2]])), false)
            assert.equal(new Map([['a', 1], ['b', 2]]).equals(new Map([['a', 1]])), false)
        })
        it('non-map', () => assert.equal(new Map([['a', 1]]).equals([['a', 1]]), false))
    })
})
