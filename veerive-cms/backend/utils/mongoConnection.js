import mongoose from 'mongoose';

/**
 * Singleton MongoDB connection for serverless environments
 * Reuses existing connections to prevent cold start issues
 */
class MongoConnection {
  constructor() {
    this.connection = null;
    this.connectionPromise = null;
  }

  async connect() {
    // If already connected, return existing connection
    if (this.connection && mongoose.connection.readyState === 1) {
      return this.connection;
    }

    // If connection is in progress, wait for it
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Create new connection
    this.connectionPromise = this.createConnection();
    
    try {
      this.connection = await this.connectionPromise;
      return this.connection;
    } catch (error) {
      this.connectionPromise = null;
      throw error;
    }
  }

  async createConnection() {
    const mongoURI = process.env.NODE_ENV === 'production'
      ? process.env.DB_URL_PRODUCTION || process.env.DB_URL || process.env.MONGODB_URI
      : process.env.DB_URL_LOCAL || process.env.DB_URL || process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MongoDB URI not found in environment variables');
    }

    // Optimized connection options for serverless
    const connectionOptions = {
      maxPoolSize: 3, // Smaller pool for serverless
      serverSelectionTimeoutMS: 15000, // 15 seconds
      socketTimeoutMS: 30000, // 30 seconds
      connectTimeoutMS: 20000, // 20 seconds
      retryWrites: true,
      w: 'majority'
    };

    const connection = await mongoose.connect(mongoURI, connectionOptions);
    
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
      this.connection = null;
      this.connectionPromise = null;
    });

    mongoose.connection.on('disconnected', () => {
      this.connection = null;
      this.connectionPromise = null;
    });

    return connection;
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      this.connection = null;
      this.connectionPromise = null;
    }
  }

  getConnection() {
    return this.connection;
  }

  isConnected() {
    return this.connection && mongoose.connection.readyState === 1;
  }
}

// Export singleton instance
const mongoConnection = new MongoConnection();
export default mongoConnection;
