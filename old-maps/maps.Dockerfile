FROM node:20-alpine3.17 AS build

WORKDIR /usr/src/app

COPY --chown=node:node ./package*.json ./

RUN npm ci

COPY --chown=node:node ./ .

ENV NODE_ENV production

RUN npm ci --only=production --force

USER node

### build prod
FROM node:20-alpine3.17 As production

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/ ./dist
EXPOSE 3000
CMD [ "node", "./dist/index.js" ]
# CMD ["tail", "-f", "/dev/null"]