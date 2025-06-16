module.exports = {
  // MongoDB connection string
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/reas-db",

  // Server port
  PORT: process.env.PORT || 5000,

  // Environment
  NODE_ENV: process.env.NODE_ENV || "development",

  // CORS settings
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
};
