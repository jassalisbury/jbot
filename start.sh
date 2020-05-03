#!/usr/bin/env bash
kill `cat ./pid.file` || true
node ./index.js &
echo $! > ./pid.file
