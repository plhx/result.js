/**
 * @file iife.js
 * @copyright 2026 PlasticHeart
 *
 * Entry point for the IIFE build. Exposes everything exported by result.js as globals.
 */
Object.assign(globalThis, require('./result.js'))
