#!/bin/bash
sleep 10

(cd database && npx prisma generate && npx prisma migrate dev --name name)

npx prisma studio &

npm run start:dev
