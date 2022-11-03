#!/usr/bin/env sh
while inotifywait -e close_write /init-sql/init.sql; do
  echo "--- Reinitialize SQL ---"
  /usr/bin/env sh /init-sql/run.sh
done