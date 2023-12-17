#!/bin/bash
sleep 10

# chown: changing ownership of '/var/lib/postgresql/data': Invalid argument
# chmod 777 /var/run/postgresql
# chown -R postgres:postgres /var/lib/data

# chmod 777 /var/lib/postgresql/data
# chown -R postgres:postgres /var/lib/postgresql/data

# if [ -z "$(ls -A database/prisma/migrations)" ]; then
(cd database && npx prisma generate)
(cd database && npx prisma migrate dev --name name)
# fi


npx prisma studio &


npm run start:dev

# sleep 1000