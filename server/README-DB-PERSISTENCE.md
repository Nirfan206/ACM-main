# Database Persistence Configuration

## Overview

This document provides instructions on ensuring data persistence in the MongoDB database for the ACM v2 application.

## Current Configuration

The application has been updated to use the following MongoDB connection options to ensure data persistence:

```javascript
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4 // Use IPv4, skip trying IPv6
})
```

The connection string has also been updated to include write concern and retry options:

```
MONGO_URI=mongodb://localhost:27017/ACM?retryWrites=true&w=majority
```

## Ensuring MongoDB Persistence

1. **Verify MongoDB Service Configuration**

   Make sure MongoDB is running as a service rather than just a temporary process:

   - For Windows:
     ```
     sc query MongoDB
     ```
     If not installed as a service, install it using:
     ```
     mongod --install --dbpath="D:\project\ACM v2\data\db"
     ```

   - For Linux/macOS:
     ```
     sudo systemctl status mongodb
     ```

2. **Check Data Directory Permissions**

   Ensure the data directory has proper permissions:
   ```
   D:\project\ACM v2\data\db
   ```

3. **Verify MongoDB Configuration**

   Create or update your MongoDB configuration file (mongod.conf) with these settings:

   ```yaml
   storage:
     dbPath: "D:\project\ACM v2\data\db"
     journal:
       enabled: true
   systemLog:
     destination: file
     path: "D:\project\ACM v2\data\logs\mongodb.log"
     logAppend: true
   net:
     bindIp: 127.0.0.1
     port: 27017
   ```

4. **Restart MongoDB Service**

   After making configuration changes, restart the MongoDB service:

   - Windows: `net stop MongoDB && net start MongoDB`
   - Linux/macOS: `sudo systemctl restart mongodb`

## Troubleshooting

If data persistence issues continue:

1. Check MongoDB logs for errors
2. Verify the data directory exists and has proper permissions
3. Ensure MongoDB is running as a service and not terminating
4. Check that the application is properly connecting to the database
5. Verify that write operations are being committed with proper write concern

## Additional Resources

- [MongoDB Documentation on Persistence](https://docs.mongodb.com/manual/core/journaling/)
- [Mongoose Connection Options](https://mongoosejs.com/docs/connections.html)