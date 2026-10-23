/**
 * @file build.test.js
 * @copyright 2026 PlasticHeart
 *
 * Tests that the IIFE build (build.sh) defines the globals.
 */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const buildSh = fileURLToPath(new URL('../build.sh', import.meta.url))
const outdir = mkdtempSync(join(tmpdir(), 'result-js-'))
execFileSync('sh', [buildSh, outdir], { stdio: 'ignore' })

describe('build', () => {
    after(() => rmSync(outdir, { recursive: true, force: true }))

    for (const file of ['result.js', 'result.min.js']) {
        describe(`IIFE ${file}`, () => {
            it('defines globals', () => {
                const context = vm.createContext({})
                vm.runInContext(readFileSync(join(outdir, file), 'utf8'), context)
                for (const name of ['Option', 'Some', 'None', 'Result', 'Ok', 'Err']) {
                    assert.equal(typeof context[name], 'function', name)
                }
                assert.equal(vm.runInContext('String(Some(1))', context), 'Some(1)')
                assert.equal(vm.runInContext('String(new Ok(2))', context), 'Ok(2)')
            })
        })
    }
})
