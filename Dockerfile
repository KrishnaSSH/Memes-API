FROM node:latest
RUN mkdir /app
WORKDIR /app
COPY templates/ ./templates/
COPY app.js ./
COPY package.json ./
COPY node_modules/ ./node_modules/
COPY tailwind.config.js ./
CMD node /app/app.js
