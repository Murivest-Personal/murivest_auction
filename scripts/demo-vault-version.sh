#!/bin/bash
# Publish a new version of a vault document (addenda notification test).
set -e
BASE=http://localhost:3000
JAR=/tmp/admin-cookies.txt
DOC_ID=${1:?document id}
FILE=${2:?pdf path}
NOTES=${3:-"Updated following requisitions"}
curl -s -b "$JAR" -X POST "$BASE/api/admin/data-rooms/documents/$DOC_ID" \
  -F "file=@$FILE;type=application/pdf" \
  -F "notes=$NOTES"
echo
