# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.12.0
FROM node:${NODE_VERSION}-alpine as base

WORKDIR /usr/src/app

FROM base as deps

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci 

FROM base as final

ENV NODE_ENV development

COPY . .

COPY --from=deps /usr/src/app/node_modules ./node_modules

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
