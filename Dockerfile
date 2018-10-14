FROM node:latest
LABEL maintainer "siggame@mst.edu"

ADD . cerveau
WORKDIR cerveau

RUN npm install
RUN npm run build

EXPOSE 3000
EXPOSE 3080
EXPOSE 3088

CMD ["npm", "run", "js"]
