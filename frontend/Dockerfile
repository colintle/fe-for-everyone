FROM node:13.12.0-alpine

WORKDIR /react-docker
COPY ./package*.json ./
ENV PATH /app/node_modules/.bin:$PATH
RUN npm install
EXPOSE 3000
CMD npm start