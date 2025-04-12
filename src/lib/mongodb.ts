
import mongoose from 'mongoose';

// Connection URI (should be in environment variables in production)
const MONGODB_URI = 'mongodb+srv://username:password@cluster0.mongodb.net/tradetracker?retryWrites=true&w=majority';

// MongoDB connection state
let cached = global as any;
cached.mongoose = cached.mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
  if (cached.mongoose.conn) {
    return cached.mongoose.conn;
  }

  if (!cached.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.mongoose.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('Connected to MongoDB');
      return mongoose;
    });
  }
  cached.mongoose.conn = await cached.mongoose.promise;
  return cached.mongoose.conn;
}
