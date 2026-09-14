#!/bin/zsh
cd /Users/paolo/stardust/2026-08/sparebank1
node stardust/scripts/eds/_w3-siblings.mjs > /tmp/_w3-siblings-final.log 2>&1; tail -1 /tmp/_w3-siblings-final.log
zsh stardust/scripts/replica/_w3-gate.sh
