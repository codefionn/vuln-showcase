#!/usr/bin/env sh
psql --username=${POSTGRES_USER:-appuser} app < /init-sql/init.sql