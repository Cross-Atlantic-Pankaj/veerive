import mongoConnection from '../../utils/mongoConnection.js';

/**
 * Middleware to ensure MongoDB connection is available
 * Especially important for serverless environments
 */
const ensureConnection = async (req, res, next) => {
  try {
    // Ensure connection is available
    if (!mongoConnection.isConnected()) {
      await mongoConnection.connect();
    }
    
    next();
  } catch (error) {
    console.error('❌ Failed to ensure MongoDB connection:', error);
    return res.status(503).json({
      error: 'Database connection unavailable. Please try again.',
      code: 'DB_CONNECTION_ERROR'
    });
  }
};

export default ensureConnection;
