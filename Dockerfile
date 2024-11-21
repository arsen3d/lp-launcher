# Use the official Node.js LTS image from the Docker Hub
FROM node:22

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm config set loglevel verbose


# Copy the rest of the application code
COPY . .
RUN npm install --verbose
# Expose the port the app runs on
