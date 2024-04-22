FROM node:21-alpine3.18

COPY . .

RUN npm install
RUN npm run build

CMD [ "npm", "run", "start" ]