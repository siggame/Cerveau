FROM node:latest

RUN groupadd -r siggame && useradd -r -g siggame siggame

RUN mkdir -p /usr/src/app/game_server/output/gamelogs
WORKDIR /usr/src/app/game_server

COPY package.json .
COPY package-lock.json .
RUN npm install && chown -R siggame:siggame /usr/src/app
COPY . /usr/src/app/game_server

USER siggame

ENV NODE_ENV=production

CMD ["node", "main.js", "--no-game-settings", "--no-web", "--no-updater", "--no-autoupdate"]
