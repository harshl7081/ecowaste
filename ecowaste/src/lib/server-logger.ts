import { MongoClient } from 'mongodb';
import { LogAction, LogEntryData } from './logger';

// Connection URI
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'ecowaste';

interface LogEntry extends LogEntryData {
  timestamp: Date;
}

/**
 * SERVER SIDE ONLY - Logs an action to the database
 * This function should only be used in API routes or server components
 */
export async function logActivity(entry: LogEntryData) {
  try {
    // Use a fallback if no MongoDB URI is provided
    if (!uri) {
      console.warn('Activity logging disabled: No database connection string');
      console.log('Would log activity:', entry);
      return { success: false, reason: 'no_db_connection' };
    }

    const logEntry: LogEntry = {
      ...entry,
      timestamp: new Date()
    };

    // Connect to MongoDB
    const client = new MongoClient(uri);
    
    try {
      await client.connect();
      const db = client.db(dbName);
      const logsCollection = db.collection('activity_logs');
      
      await logsCollection.insertOne(logEntry);
      
      return { success: true };
    } catch (error) {
      console.error('Error logging activity to database:', error);
      return { success: false, reason: 'db_error' };
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Failed to log activity:', error);
    return { success: false, reason: 'unknown_error' };
  }
} 