import mongoose, { Schema } from 'mongoose';
import { LogLevel } from '@/lib/logger';

// Define the Log Schema
const LogSchema = new Schema({
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  level: {
    type: String,
    enum: Object.values(LogLevel),
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
  },
  route: {
    type: String,
  },
  data: {
    type: Schema.Types.Mixed,
  },
  ip: {
    type: String,
  },
  userAgent: {
    type: String,
  },
}, {
  // Add timestamps for when the document was created and last updated
  timestamps: true,
});

// Create indexes for efficient querying
LogSchema.index({ timestamp: -1 }); // Sort by timestamp in descending order
LogSchema.index({ level: 1 }); // Filter by log level
LogSchema.index({ userId: 1 }); // Filter by user
LogSchema.index({ route: 1 }); // Filter by route

// Create and export the model
const Log = mongoose.models.Log || mongoose.model('Log', LogSchema);

export default Log; 