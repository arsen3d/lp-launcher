# Use the official Node.js LTS image from the Docker Hub
FROM node:20

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./


# RUN npm config set registry https://registry.npm.taobao.org

# Increase npm fetch timeout
RUN npm config set fetch-retries 5
RUN npm config set fetch-retry-mintimeout 20000
RUN npm config set fetch-retry-maxtimeout 120000


# Install dependencies
RUN npm cache clean --force
RUN npm config set loglevel verbose
RUN npm i -g nodemon --verbose

# Copy the rest of the application code
COPY . .
RUN npm install --verbose
# Expose the port the app runs on
