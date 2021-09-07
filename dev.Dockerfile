FROM node:15

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

CMD [ "npm", "run", "start-dev" ]