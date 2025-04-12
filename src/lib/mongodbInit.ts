
import { connectToDatabase } from './mongodb';

export async function initializeMongoDB() {
  try {
    await connectToDatabase();
    console.log('MongoDB initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize MongoDB:', error);
    return false;
  }
}
