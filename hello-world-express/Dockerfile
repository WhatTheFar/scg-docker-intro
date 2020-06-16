FROM node:13-alpine
WORKDIR /app
COPY ./package.json .
RUN npm install
COPY ./src/app.js ./src/app.js
EXPOSE 5000
CMD ["npm", "start"]
