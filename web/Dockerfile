FROM node:20-slim

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

COPY next.config.ts tsconfig.json postcss.config.js tailwind.config.ts ./
COPY app ./app
COPY components ./components
COPY styles ./styles

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
