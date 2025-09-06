#!/bin/bash

export DATABASE_URL="postgres://postgres:postgres@localhost:5432/cashflow"

npm run db:push

npm run dev