FROM node:18.17.0

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install nodemon prisma class-validator class-transformer --save-dev

COPY . .

RUN npx prisma generate



EXPOSE 8011

CMD ["npm", "run", "dev"]
