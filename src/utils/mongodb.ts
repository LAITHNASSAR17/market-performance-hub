
export class MongoDB {
  private static instance: MongoDB;
  private connection: any = null;
  private config: MongoDBConfig | null = null;
  private connected: boolean = false;

  private constructor() {}

  static getInstance(): MongoDB {
    if (!MongoDB.instance) {
      MongoDB.instance = new MongoDB();
    }
    return MongoDB.instance;
  }

  async connect(config: MongoDBConfig): Promise<boolean> {
    try {
      this.config = config;
      
      // In a real implementation, we would use MongoDB client
      // For now, we're using a mock connection for development
      this.connection = {
        connected: true,
        collection: (collectionName: string) => ({
          find: async (query: any = {}) => {
            console.log('MongoDB Query:', query, 'Collection:', collectionName);
            
            // Return mock data for testing
            if (collectionName === 'users') {
              return [{ _id: '1', username: 'admin', email: 'admin@example.com', isBlocked: false, createdAt: new Date() }];
            }
            return [];
          },
          findOne: async (query: any = {}) => {
            console.log('MongoDB FindOne Query:', query, 'Collection:', collectionName);
            
            if (collectionName === 'users' && query._id === '1') {
              return { _id: '1', username: 'admin', email: 'admin@example.com' };
            }
            return null;
          },
          insertOne: async (document: any) => {
            console.log('MongoDB Insert:', document, 'Collection:', collectionName);
            return { insertedId: Date.now().toString() };
          },
          updateOne: async (query: any, update: any) => {
            console.log('MongoDB Update:', query, update, 'Collection:', collectionName);
            return { modifiedCount: 1 };
          },
          deleteOne: async (query: any) => {
            console.log('MongoDB Delete:', query, 'Collection:', collectionName);
            return { deletedCount: 1 };
          },
          countDocuments: async (query: any = {}) => {
            console.log('MongoDB Count:', query, 'Collection:', collectionName);
            return 5; // Mock count
          }
        })
      };
      
      this.connected = true;
      return true;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      this.connected = false;
      return false;
    }
  }

  collection(name: string): any {
    if (!this.connection) {
      throw new Error('MongoDB not connected');
    }
    
    return this.connection.collection(name);
  }

  disconnect(): void {
    if (this.connection) {
      this.connection = null;
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getConfig(): MongoDBConfig | null {
    return this.config;
  }
}
