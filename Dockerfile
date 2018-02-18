FROM node:latest

RUN mkdir -p /usr/src/app/game_server/output/gamelogs
WORKDIR /usr/src/app/game_server

COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . /usr/src/app/game_server

ENV NODE_ENV=production

CMD ["node", "main.js", "--no-web", "--no-updater", "--no-autoupdate"]
