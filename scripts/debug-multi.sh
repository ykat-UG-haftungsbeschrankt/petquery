#!/bin/sh
set -eu

npm run build:server
npm run build:gui
exec node scripts/start-debug-servers.mjs
