#!/bin/bash
# Demo setup: create data room documents + grants via the admin API.
set -e
BASE=http://localhost:3000
JAR=/tmp/admin-cookies.txt
rm -f "$JAR"

# 1. Admin session
curl -s -c "$JAR" -X POST "$BASE/api/admin/session" \
  -H "Content-Type: application/json" -d '{"passcode":"murivest-admin"}' > /dev/null

# 2. Amina's buyer id
BUYER_ID=$(bun run scripts/list-buyers.ts 2>/dev/null | rg -B 6 "amina" | rg '"id"' | head -1 | sed 's/.*"id": "\([^"]*\)".*/\1/')
echo "buyer: $BUYER_ID"

# 3. Document 1 — title deed (downloadable)
curl -s -b "$JAR" -X POST "$BASE/api/admin/data-rooms/documents" \
  -F "property_slug=westlands-office-block" \
  -F "title=Title deed & official search" \
  -F "category=title" \
  -F "allow_download=true" \
  -F "notes=Supplied by the chargee's advocates" \
  -F "file=@public/legal/conditions-of-sale-kenya.pdf;type=application/pdf"
echo

# 4. Document 2 — legal pack (view-only)
curl -s -b "$JAR" -X POST "$BASE/api/admin/data-rooms/documents" \
  -F "property_slug=westlands-office-block" \
  -F "title=Conditions of sale — special conditions" \
  -F "category=legal_pack" \
  -F "allow_download=false" \
  -F "file=@public/legal/conditions-of-sale-uk.pdf;type=application/pdf"
echo

# 5. Grant Amina access to the property
curl -s -b "$JAR" -X POST "$BASE/api/admin/data-rooms/grants" \
  -H "Content-Type: application/json" \
  -d "{\"buyer_id\":\"$BUYER_ID\",\"property_slug\":\"westlands-office-block\"}"
echo
