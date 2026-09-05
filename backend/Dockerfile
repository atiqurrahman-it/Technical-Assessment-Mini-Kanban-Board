# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy the rest of the application files
COPY . .

# Install dependencies, generate the Prisma client, and build the application
RUN npm install && npm run prisma:generate && npm run build

# Expose the port your app runs on
EXPOSE 4000

# Apply pending migrations, then start the application
CMD ["sh", "-c", "npm run prisma:deploy && npm run start"]