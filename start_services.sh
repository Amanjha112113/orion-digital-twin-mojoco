#!/bin/bash
lsof -ti:3000,8000 | xargs kill -9 2>/dev/null
sleep 1
bash run.sh > output.log 2>&1
