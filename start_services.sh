#!/bin/bash
ps -ef | grep "[p]ython\|[m]jpython\|[n]ode" | awk '{print $2}' | xargs kill -9 2>/dev/null
sleep 1
bash run.sh > output.log 2>&1
