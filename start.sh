#!/usr/bin/env bash
kill `cat ./pid.file` || true
node ./index.js & echo $1 > ./pid.file
