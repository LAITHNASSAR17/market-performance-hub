
import mongoose from 'mongoose';

// Connection URI (should be in environment variables in production)
const MONGODB_URI = 'mongodb+srv://username:password@cluster0.mongodb.net/tradetracker?retryWrites=true&w=majority';

// MongoDB connection state
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Using a local variable instead of global
const mongooseCache: MongooseCache = { conn: null, promise: null };

export async function connectToDatabase() {
  if (mongooseCache.conn) {
    return mongooseCache.conn;
  }

  if (!mongooseCache.promise) {
    const opts = {
      bufferCommands: false,
    };

    mongooseCache.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('Connected to MongoDB');
      return mongoose;
    });
  }
  mongooseCache.conn = await mongooseCache.promise;
  return mongooseCache.conn;
}
