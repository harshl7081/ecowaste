import { MongoClient } from 'mongodb';
import connectDB from './mongodb';

// Enumeration for log levels
export enum LogLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  DEBUG = 'debug',
}

// Interface for log entry
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  userId?: string; // Optional user ID if authenticated
  route?: string; // API route or page path
  data?: any; // Additional contextual data
  ip?: string; // IP address
  userAgent?: string; // Browser/device info
}

// Logger class
export class Logger {
  private static instance: Logger;
  private logQueue: LogEntry[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private isFlushing = false;

  private constructor() {
    // Set interval to flush logs to DB 
    this.flushInterval = setInterval(() => this.flushLogs(), 30000); // Flush every 30 seconds
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Log a message with the specified level
   */
  public async log(
    level: LogLevel,
    message: string,
    options: {
      userId?: string;
      route?: string;
      data?: any;
      ip?: string;
      userAgent?: string;
    } = {}
  ): Promise<void> {
    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      ...options,
    };

    // Add to queue
    this.logQueue.push(logEntry);

    // If queue gets large, flush immediately
    if (this.logQueue.length >= 100) {
      this.flushLogs();
    }

    // Also console log in development
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = level === LogLevel.ERROR ? console.error : console.log;
      consoleMethod(`[${level.toUpperCase()}] ${message}`, options);
    }
  }

  /**
   * Convenience method for info logs
   */
  public info(message: string, options = {}): void {
    this.log(LogLevel.INFO, message, options);
  }

  /**
   * Convenience method for warning logs
   */
  public warning(message: string, options = {}): void {
    this.log(LogLevel.WARNING, message, options);
  }

  /**
   * Convenience method for error logs
   */
  public error(message: string, options = {}): void {
    this.log(LogLevel.ERROR, message, options);
  }

  /**
   * Convenience method for debug logs
   */
  public debug(message: string, options = {}): void {
    if (process.env.NODE_ENV === 'development') {
      this.log(LogLevel.DEBUG, message, options);
    }
  }

  /**
   * Flush log queue to database
   */
  private async flushLogs(): Promise<void> {
    if (this.logQueue.length === 0 || this.isFlushing) {
      return;
    }

    try {
      this.isFlushing = true;
      
      // Copy current queue and clear it
      const logsToFlush = [...this.logQueue];
      this.logQueue = [];

      // Connect to MongoDB
      try {
        await connectDB();
        
        const uri = process.env.MONGODB_URI;
        if (!uri) {
          console.error('MONGODB_URI is not defined');
          return;
        }
        
        const client = new MongoClient(uri);
        await client.connect();
        
        const dbName = process.env.MONGODB_DB_NAME || 'ecowaste';
        const db = client.db(dbName);
        
        // Store logs in logs collection
        const logsCollection = db.collection('logs');
        await logsCollection.insertMany(logsToFlush);
        
        await client.close();
      } catch (error) {
        console.error('Failed to store logs:', error);
        // Return logs to queue if storing fails
        this.logQueue = [...logsToFlush, ...this.logQueue];
      }
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Force flush all logs (useful before app shutdown)
   */
  public async forceFlush(): Promise<void> {
    clearInterval(this.flushInterval as NodeJS.Timeout);
    this.flushInterval = null;
    await this.flushLogs();
  }
}

// Create and export a singleton instance
const logger = Logger.getInstance();
export default logger; 