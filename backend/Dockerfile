# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy the rest of the application files
COPY . .

# Install dependencies and build the application
RUN npm install && npm run build

# Expose the port your app runs on
EXPOSE 4000

# Start the application
CMD ["npm", "run", "start"]