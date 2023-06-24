FROM node:18

WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --omit=dev

COPY ./src ./src

CMD [ "node", "src/app.js" ]
