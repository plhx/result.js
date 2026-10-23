/**
 * @file result.js
 * @copyright 2026 PlasticHeart
 */
!(module => {
    'use strict'

    class OptionError extends Error {

    }

    class FlattenError extends OptionError {

    }

    class ExpectError extends OptionError {

    }

    class TransposeError extends OptionError {

    }

    class UnwrapError extends OptionError {

    }

    class UnzipError extends OptionError {

    }

    class Unit {

    }

    class Option {
        equals(other) { }
        compare(other) { }

        and(other) { }
        andThen(f) { }
        expect(message) { }
        filter(predicate) { }
        flatten() { }
        get isNone() { }
        isNoneOr(f) { }
        get isSome() { }
        isSomeAnd(f) { }
        map(f) { }
        mapOr(defaultValue, f) { }
        mapOrElse(d, f) { }
        okOr(error) { }
        okOrElse(f) { }
        or(other) { }
        orElse(f) { }
        transpose() { }
        unwrap() { }
        unwrapOr(defaultValue) { }
        unwrapOrElse(f) { }
        xor(other) { }
        zip(other) { }
        unzip() { }
    }

    class Some extends Option {
        #value

        constructor(value) {
            super()
            this.#value = value ?? new None()
        }

        toString() { return `Some(${this.#value})` }
        toJSON() {
            // JSON.stringify does not call toJSON again on the returned value, so unwrap nested Options here.
            return this.#value instanceof Option ? this.#value.toJSON() : this.#value
        }

        and(other) { return other }
        andThen(f) { return f(this.#value) }
        expect(message) { return this.#value }
        filter(predicate) { return predicate(this.#value) ? this : new None() }
        flatten() { if (this.#value instanceof Option) { return this.#value } throw new FlattenError('Option.flatten() on a non-Option<Option<T>> value') }
        get isNone() { return false }
        isNoneOr(f) { return !!f(this.#value) }
        get isSome() { return true }
        isSomeAnd(f) { return !!f(this.#value) }
        map(f) { return new Some(f(this.#value)) }
        mapOr(defaultValue, f) { return f(this.#value) }
        mapOrElse(d, f) { return f(this.#value) }
        okOr(error) { return new Ok(this.#value) }
        okOrElse(f) { return new Ok(this.#value) }
        or(other) { return this }
        orElse(f) { return this }
        transpose() { if (this.#value instanceof Result) { return this.#value.map(x => new Some(x)) } throw new TransposeError('Option.transpose() on a non-Option<Result<T, E>> value') }
        unwrap() { return this.#value }
        unwrapOr(defaultValue) { return this.#value }
        unwrapOrElse(f) { return this.#value }
        unzip() { if (Array.isArray(this.#value) && this.#value.length == 2) { return this.#value.map(x => new Some(x)) } throw new UnzipError('Option.unzip() on a non-Option<[T, U]> value') }
        xor(other) { return other.isNone ? this : new None() }
        zip(other) { return other.map(x => [this.#value, x]) }
    }

    class None extends Option {
        constructor(value) {
            super()
        }

        toString() { return 'None' }
        toJSON() { return null }

        and(other) { return this }
        andThen(f) { return this }
        expect(message) { throw new ExpectError(message) }
        filter(predicate) { return this }
        flatten() { return this }
        get isNone() { return true }
        isNoneOr(f) { return true }
        get isSome() { return false }
        isSomeAnd(f) { return false }
        map(f) { return this }
        mapOr(defaultValue, f) { return defaultValue }
        mapOrElse(d, f) { return d() }
        okOr(error) { return new Err(error) }
        okOrElse(f) { return new Err(f()) }
        or(other) { return other }
        orElse(f) { return f() }
        transpose() { return new Ok(new None()) }
        unwrap() { throw new UnwrapError('Option.unwrap() on a None value') }
        unwrapOr(defaultValue) { return defaultValue }
        unwrapOrElse(f) { return f() }
        unzip() { return [new None(), new None()] }
        xor(other) { return other }
        zip(other) { return this }
    }

    class Result {
        and() { }
        andThen() { }
        err() { }
        expect() { }
        expectErr() { }
        flatten() { }
        inspect() { }
        inspectErr() { }
        get isErr() { }
        isErrAnd() { }
        get isOk() { }
        isOkAnd() { }
        map() { }
        mapErr() { }
        mapOr() { }
        mapOrElse() { }
        ok() { }
        or() { }
        orElse() { }
        transpose() { }
        unwrap() { }
        unwrapErr() { }
        unwrapOr() { }
        unwrapOrElse() { }
    }

    class Ok extends Result {
        #value

        constructor(value) {
            super()
            this.#value = value ?? new None()
        }

        toString() { return `Ok(${this.#value})` }

        and(other) { return other }
        andThen(f) { return f(this.#value) }
        err() { return new None() }
        expect(message) { return this.#value }
        expectErr(message) { throw new ExpectError(`${message}: ${this.#value}`) }
        flatten() { if (this.#value instanceof Result) { return this.#value } throw new FlattenError('Result.flatten() on a non-Result<Result<T, E>> value') }
        inspect(f) { return f(this.#value), this }
        inspectErr(f) { return this }
        get isErr() { return false }
        isErrAnd(f) { return false }
        get isOk() { return true }
        isOkAnd(f) { return !!f(this.#value) }
        map(f) { return new Ok(f(this.#value)) }
        mapErr(f) { return this }
        mapOr(defaultValue, f) { return f(this.#value) }
        mapOrElse(d, f) { return f(this.#value) }
        ok() { return new Some(this.#value) }
        or(other) { return this }
        orElse(f) { return this }
        transpose() { if (this.#value instanceof Option) { return this.#value.map(x => new Ok(x)) } throw new TransposeError('Result.transpose() on a non-Result<Option<T>, E> value') }
        unwrap() { return this.#value }
        unwrapErr() { throw new UnwrapError('Result.unwrap() on an Ok value') }
        unwrapOr(defaultValue) { return this.#value }
        unwrapOrElse(f) { return this.#value }
    }

    class Err extends Result {
        #value

        constructor(value) {
            super()
            this.#value = value
        }

        toString() { return `Err(${this.#value})` }

        and(other) { return this }
        andThen(f) { return this }
        err() { return new Some(this.#value) }
        expect(message) { throw new ExpectError(`${message}: ${this.#value}`) }
        expectErr(message) { return this.#value }
        flatten() { return this }
        inspect(f) { return this }
        inspectErr(f) { return f(this.#value), this }
        get isErr() { return true }
        isErrAnd(f) { return !!f(this.#value) }
        get isOk() { return false }
        isOkAnd(f) { return false }
        map(f) { return this }
        mapErr(f) { return new Err(f(this.#value)) }
        mapOr(defaultValue, f) { return defaultValue }
        mapOrElse(d, f) { return d(this.#value) }
        ok() { return new None() }
        or(other) { return other }
        orElse(f) { return f(this.#value) }
        transpose() { return new Some(this) }
        unwrap() { throw new UnwrapError('Result.unwrap() on an Err value') }
        unwrapErr() { return this.#value }
        unwrapOr(defaultValue) { return defaultValue }
        unwrapOrElse(f) { return f(this.#value) }
    }

    function toIterator(value) {
        if (typeof value == 'string' || Array.isArray(value)) {
            return value.values()
        }
        return value[Symbol.iterator]()
    }

    class ZipLongest extends Iterator {
        #lhs
        #rhs

        constructor(lhs, rhs) {
            super()
            this.#lhs = toIterator(lhs)
            this.#rhs = toIterator(rhs)
        }

        next() {
            const [a, b] = [this.#lhs.next(), this.#rhs.next()]
            return { done: a.done && b.done, value: [a.value, b.value] }
        }
    }

    Boolean.prototype.equals = function (other) {
        return this === other
    }

    Boolean.prototype.compare = function (other) {
        return typeof other == 'boolean' ? this - other : NaN
    }

    Boolean.prototype.okOr = function (error) {
        return this ? Ok(new Unit()) : new Err(error)
    }

    Boolean.prototype.okOrElse = function (f) {
        return this ? Ok(new Unit()) : new Err(f())
    }

    Boolean.prototype.then = function (f) {
        return this ? new Some(f()) : new None()
    }

    Boolean.prototype.thenSome = function (value) {
        return this ? new Some(value) : new None()
    }

    Number.prototype.equals = function (other) {
        return this === other
    }

    Number.prototype.compare = function (other) {
        return typeof other == 'number' ? this - other : NaN
    }

    Array.prototype.equals = function (other) {
        return Array.isArray(other)
            ? new ZipLongest(this, other).every(([a, b]) => a?.equals(b) ?? false)
            : false
    }

    Array.prototype.compare = function (other) {
        if (Array.isArray(other)) {
            return new ZipLongest(this, other)
                .map(([a, b]) => a?.compare(b) ?? NaN)
                .find(x => x !== 0) ?? 0
        }
        return NaN
    }

    Set.prototype.equals = function (other) {
        return other instanceof Set
            ? this.size == other.size && this.keys().every(x => other.has(x))
            : false
    }

    Map.prototype.equals = function (other) {
        return other instanceof Map
            ? this.size == other.size && this.keys().every(x => other.has(x) && (this.get(x)?.equals(other.get(x)) ?? false))
            : false
    }

    JSON.tryParse = function (text, reviver) {
        const toNone = function (key, value) {
            const revived = reviver ? reviver.call(this, key, value) : value
            return revived == null ? new None() : revived
        }
        try {
            return new Ok(JSON.parse(text, toNone))
        } catch (error) {
            if (error instanceof SyntaxError) {
                return new Err(error)
            }
            throw error
        }
    }

    const callable = target => new Proxy(target, { apply: (target, _, args) => new target(...args) })
    Unit = callable(Unit)
    Some = callable(Some)
    None = callable(None)
    Ok = callable(Ok)
    Err = callable(Err)

    module.exports = {
        Unit,
        Option, Some, None, Result, Ok, Err,
        OptionError, ExpectError, FlattenError, TransposeError, UnwrapError, UnzipError
    }
})(typeof module === 'object' && module !== null ? module : { set exports(value) { Object.assign(globalThis, value) } })
