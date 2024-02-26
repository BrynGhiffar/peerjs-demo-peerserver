#!/usr/bin/bash

# -v $(pwd)/turnserver.conf:/etc/coturn/turnserver.conf \
docker container stop coturn-server
docker container rm coturn-server
docker run -d -p 3478:3478 -p 3478:3478/udp -p 5349:5349 -p 5349:5349/udp -p 49160-49200:49160-49200/udp \
    --name coturn-server \
    coturn/coturn --min-port=49160 --max-port=49200 \
    --user user01:pass01