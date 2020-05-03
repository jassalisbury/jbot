#!/usr/bin/env bash
kill `cat ./pid.file` || true
# actions hack https://github.com/appleboy/ssh-action/issues/40
nohup node ./index.js > nohup.out 2> nohub.err < /dev/null &
echo $! > ./pid.file
