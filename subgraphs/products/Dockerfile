FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts
COPY . .
EXPOSE 4002
CMD ["node", "index.js"]
