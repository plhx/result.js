/**
 * @file json.test.js
 * @copyright 2026 PlasticHeart
 *
 * Tests for JSON.tryParse: invalid JSON becomes Err(SyntaxError), anything else becomes Ok,
 * and null / undefined become None at any depth (including the root).
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Ok, Option, assertEq } from './helpers.js'

describe('JSON.tryParse', () => {
    describe('valid JSON', () => {
        it('object', () => {
            const result = JSON.tryParse('{"a":1,"b":[2,3]}')
            assert.equal(result.isOk, true)
            assert.deepEqual(result.unwrap(), { a: 1, b: [2, 3] })
        })
        it('array', () => {
            const result = JSON.tryParse('[1,2,3]')
            assert.equal(result.isOk, true)
            assert.deepEqual(result.unwrap(), [1, 2, 3])
        })
        it('number', () => assertEq(JSON.tryParse('42'), Ok(42)))
        it('zero', () => assertEq(JSON.tryParse('0'), Ok(0)))
        it('string', () => assertEq(JSON.tryParse('"hi"'), Ok('hi')))
        it('empty string', () => assertEq(JSON.tryParse('""'), Ok('')))
        it('true', () => assertEq(JSON.tryParse('true'), Ok(true)))
        it('false', () => assertEq(JSON.tryParse('false'), Ok(false)))
        it('surrounding whitespace', () => assertEq(JSON.tryParse(' 1 '), Ok(1)))
    })

    describe('null at the root', () => {
        it('null literal', () => {
            const result = JSON.tryParse('null')
            assert.equal(result.isOk, true)
            assert.equal(result.unwrap().isNone, true)
        })
        it('null input', () => {
            const result = JSON.tryParse(null)
            assert.equal(result.isOk, true)
            assert.equal(result.unwrap().isNone, true)
        })
        it('reviver result', () => {
            const result = JSON.tryParse('1', () => undefined)
            assert.equal(result.isOk, true)
            assert.equal(result.unwrap().isNone, true)
        })
    })

    describe('nested null', () => {
        it('object property', () => {
            const value = JSON.tryParse('{"a":null,"b":1}').unwrap()
            assert.equal(value.a.isNone, true)
            assert.equal(value.b, 1)
        })
        it('array element', () => {
            const value = JSON.tryParse('[1,null,3]').unwrap()
            assert.equal(value.length, 3)
            assert.equal(value[0], 1)
            assert.equal(value[1].isNone, true)
            assert.equal(value[2], 3)
        })
        it('deeply nested', () => {
            const value = JSON.tryParse('{"a":{"b":[{"c":null}]}}').unwrap()
            assert.equal(value.a.b[0].c.isNone, true)
        })
        it('does not wrap other values in Some', () => {
            const value = JSON.tryParse('{"a":1,"b":"x","c":[true]}').unwrap()
            assert.deepEqual(value, { a: 1, b: 'x', c: [true] })
            assert.equal(value.a instanceof Option, false)
        })
        it('undefined from a reviver does not delete the property', () => {
            const value = JSON.tryParse('{"a":1,"b":2}', (key, value) => key === 'a' ? undefined : value).unwrap()
            assert.equal('a' in value, true)
            assert.equal(value.a.isNone, true)
            assert.equal(value.b, 2)
        })
    })

    describe('JSON.stringify', () => {
        it('turns None back into null', () => {
            const text = '{"a":null,"b":[1,null],"c":2}'
            assert.equal(JSON.stringify(JSON.tryParse(text).unwrap()), text)
        })
    })

    describe('invalid JSON', () => {
        for (const [name, text] of [
            ['broken syntax', '{"a":'],
            ['empty string', ''],
            ['undefined literal', 'undefined'],
            ['single quotes', "{'a':1}"],
            ['undefined input', undefined],
        ]) {
            it(name, () => {
                const result = JSON.tryParse(text)
                assert.equal(result.isErr, true)
                assert.ok(result.unwrapErr() instanceof SyntaxError)
            })
        }
    })

    describe('reviver', () => {
        it('is applied', () => assertEq(JSON.tryParse('1', (_key, value) => value + 1), Ok(2)))
        it('is called with the holder as this', () => {
            const holders = []
            JSON.tryParse('{"a":1}', function (key, value) {
                holders.push([key, this])
                return value
            })
            assert.equal(holders[0][0], 'a')
            assert.deepEqual(holders[0][1], { a: 1 })
        })
        it('errors other than SyntaxError are rethrown', () => {
            assert.throws(() => JSON.tryParse('1', () => { throw new RangeError('boom') }), RangeError)
        })
    })
})
