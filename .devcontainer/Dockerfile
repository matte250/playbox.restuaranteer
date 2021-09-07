FROM node:15

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci

ENTRYPOINT [ "npm", "run", "start-dev" ]