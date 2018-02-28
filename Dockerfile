FROM node:latest as build

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .

ENV NODE_ENV=production
RUN npm install
COPY . .

FROM node:alpine

ENV NODE_ENV=production
RUN apk add --no-cache tini \
    && addgroup -S siggame && adduser -S -G siggame siggame \
    && mkdir -p /game_server/output/gamelogs
WORKDIR /game_server
COPY --from=build --chown=siggame:siggame /usr/src/app /game_server/

USER siggame

ENTRYPOINT [ "/sbin/tini", "--", "node", "main.js" ]
CMD ["--no-game-settings", "--no-web", "--no-updater", "--no-autoupdate"]
