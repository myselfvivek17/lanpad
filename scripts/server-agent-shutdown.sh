#!/usr/bin/env bash
set -euo pipefail
DELAY="${1:-30}"
# /sbin/shutdown takes minutes; convert seconds.
MINUTES=$(( (DELAY + 59) / 60 ))
/sbin/shutdown -h +"$MINUTES"
