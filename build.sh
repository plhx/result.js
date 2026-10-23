#!/bin/sh
# Bundle src/iife.js into <outdir>/result.js and <outdir>/result.min.js with esbuild.
# Usage: ./build.sh [outdir]   (outdir is relative to the project root, default: dist)
set -eu
cd "$(dirname "$0")"

out="${1:-dist}"

npx --no-install esbuild src/iife.js --bundle --format=iife --outfile="$out/result.js"
npx --no-install esbuild src/iife.js --bundle --format=iife --minify --outfile="$out/result.min.js"
