# Use an official Node.js runtime as the base image
FROM node:20



ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Set working directory
WORKDIR /app

# Copy the rest of the application code
COPY . .



# Install dependencies
RUN npm install && npm run build




# Expose the port Next.js runs on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]