FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json for caching
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the app
COPY . .

# Expose the port your app listens on
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]
