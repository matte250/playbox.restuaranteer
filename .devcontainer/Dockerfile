FROM node:18.0 AS builder

RUN apt-get update && \
    apt-get -y install default-jre

WORKDIR /usr/src/app

CMD tail -f /dev/null