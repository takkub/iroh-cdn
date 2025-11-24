FROM node:20-slim

ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

COPY next.config.ts tsconfig.json postcss.config.js tailwind.config.ts auth.config.ts auth.ts ./
COPY app ./app
COPY components ./components
COPY styles ./styles
COPY store ./store
COPY lib ./lib
COPY types ./types
COPY .env* ./

RUN echo "Building with NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL" && npm run build

EXPOSE 5555
CMD ["npm", "run", "start"]
