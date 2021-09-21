FROM node:16.8 AS builder


WORKDIR /usr/src/app
COPY package*.json ./

RUN npm ci

CMD tail -f /dev/null