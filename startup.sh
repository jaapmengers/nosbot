#!/bin/bash

redis-server --daemonize yes

env | sed 's/^\(.*\)$/export \1/g' >> /root/envs.sh
chmod +x /root/envs.sh

cron

forever /src/selection/index.js start >> /var/log/selecting.log 2>&1

tail -f /var/log/generating.log
