/**
 * @file helpers.js
 * @copyright 2026 PlasticHeart
 */
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export const {
    Unit,
    Option, Some, None,
    Result, Ok, Err,
    OptionError, ExpectError, FlattenError, TransposeError, UnwrapError, UnzipError,
} = require('../src/result.js')

const show = value => Array.isArray(value) ? `(${value.map(show).join(', ')})` : String(value)

/**
 * Compare Option / Result values (and tuples of them) by `toString()`.
 * `or`, `and`, etc. do not always return a new instance, so compare by value, not by identity.
 */
export function assertEq(actual, expected) {
    assert.equal(show(actual), show(expected))
}
