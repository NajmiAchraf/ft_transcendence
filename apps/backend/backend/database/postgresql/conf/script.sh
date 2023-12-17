#!/bin/bash

sudo mkdir -p /var/lib/postgresql/data
echo "Created directory /var/lib/postgresql/data"

sudo chown -R root:root /var/lib/postgresql/data
echo "Changed owner of /var/lib/postgresql/data to root"

sudo chmod 777 /var/lib/postgresql/data
echo "Changed permissions of /var/lib/postgresql/data to 777"