FROM node:18-alpine

WORKDIR /react-docker
COPY ./package*.json ./
ENV PATH /app/node_modules/.bin:$PATH
RUN npm install
RUN npm install --save --save-exact pdfjs-dist@3.4.120
COPY . ./
EXPOSE 3000

CMD ["npm", "start"]
