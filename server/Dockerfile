FROM node:16.8

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . . 

RUN npx prisma generate

RUN npm run build:dev

EXPOSE 3000
CMD node --es-module-specifier-resolution=node dist/index.js && npx prisma migrate deploy