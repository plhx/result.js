#!/bin/sh
# Run the tests with Node's built-in test runner. Extra arguments are passed through.
# Usage: ./test.sh [node --test options or files]
set -eu
cd "$(dirname "$0")"

exec node --test "$@"
