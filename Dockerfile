FROM node:15

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . . 

RUN npm run build

EXPOSE 3000
CMD [ "node", "dist/index.js" ]