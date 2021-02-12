#!/usr/bin/env bash
pkill node
# actions hack https://github.com/appleboy/ssh-action/issues/40
nohup node ./index.js > nohup.out 2> nohup.err < /dev/null &
