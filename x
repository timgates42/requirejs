#!/bin/sh

# A command line tool to run some scripts used in the RequireJS project.

MYDIR=`cd \`dirname "$0"\`; pwd`
node $MYDIR/x.js $MYDIR "$@"
