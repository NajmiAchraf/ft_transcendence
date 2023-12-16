#!/bin/bash

if [ -z "$(ls -A database/prisma/migrations)" ]; then
    (cd database && npx prisma migrate dev --name name)
fi

(cd database && npx prisma generate) 
# npx prisma studio

npm run start:dev

# sleep 1000