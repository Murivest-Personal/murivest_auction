#!/bin/bash
# Revoke the active grant for Amina + westlands-office-block.
set -e
BASE=http://localhost:3000
JAR=/tmp/admin-cookies.txt
GRANT_ID=$(bun run scripts/list-grants.ts 2>/dev/null | tail -1)
echo "grant: $GRANT_ID"
curl -s -b "$JAR" -X DELETE "$BASE/api/admin/data-rooms/grants" \
  -H "Content-Type: application/json" \
  -d "{\"grant_id\":\"$GRANT_ID\",\"reason\":\"Demo revocation test\"}"
echo
