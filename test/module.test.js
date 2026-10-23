/**
 * @file module.test.js
 * @copyright 2026 PlasticHeart
 *
 * Tests that src/result.js works both as a Node module and as an IIFE script.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { describe, it } from 'node:test'
import vm from 'node:vm'

const require = createRequire(import.meta.url)
const path = new URL('../src/result.js', import.meta.url)

describe('module', () => {
    describe('Node', () => {
        it('require', () => {
            const { Some, None, Ok, Err, Option, Result, UnwrapError } = require('../src/result.js')
            assert.equal(String(Some(1)), 'Some(1)')
            assert.equal(String(new None()), 'None')
            assert.equal(String(Ok(2)), 'Ok(2)')
            assert.equal(String(new Err('e')), 'Err(e)')
            assert.equal(typeof Option, 'function')
            assert.equal(typeof Result, 'function')
            assert.equal(typeof UnwrapError, 'function')
        })

        it('import', async () => {
            const { Some, UnwrapError } = await import('../src/result.js')
            assert.equal(String(Some(1)), 'Some(1)')
            assert.equal(typeof UnwrapError, 'function')
        })

        it('does not define globals', () => {
            assert.equal(typeof globalThis.Some, 'undefined')
        })
    })

    describe('IIFE', () => {
        const context = vm.createContext({})
        vm.runInContext(readFileSync(path, 'utf8'), context)

        it('defines globals', () => {
            for (const name of ['Option', 'Some', 'None', 'Result', 'Ok', 'Err']) {
                assert.equal(typeof context[name], 'function', name)
            }
        })

        it('can be used with or without new', () => {
            assert.equal(vm.runInContext('String(Some(1))', context), 'Some(1)')
            assert.equal(vm.runInContext('String(new Some(1))', context), 'Some(1)')
            assert.equal(vm.runInContext('Some(1) instanceof Option', context), true)
        })
    })
})
