FROM node:20-alpine
WORKDIR /app
COPY package*.json Node.js ./
RUN npm install --omit=dev
COPY --chown=node:node . .
USER node
EXPOSE 3000
HEALTHCHECK CMD wget --spider -q http://localhost:3000/health || exit 1
CMD ["node","Node.js"]
