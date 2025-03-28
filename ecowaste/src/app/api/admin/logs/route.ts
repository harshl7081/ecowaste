import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { currentUser } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/auth';

// Connection URI
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'ecowaste';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and admin
    const user = await currentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin status
    const adminStatus = await isAdmin(user.id);
    if (!adminStatus) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const page = parseInt(url.searchParams.get('page') || '1');
    const action = url.searchParams.get('action');
    const path = url.searchParams.get('path');
    const userIdFilter = url.searchParams.get('userId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Build query
    const query: Record<string, any> = {};
    
    if (action) query.action = action;
    if (path) query.path = path;
    if (userIdFilter) query.userId = userIdFilter;
    
    // Add date filter if provided
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Connect to MongoDB
    if (!uri) {
      return NextResponse.json(
        { error: 'Database connection string not configured' },
        { status: 500 }
      );
    }

    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db(dbName);
    const logsCollection = db.collection('activity_logs');

    // Get total count for pagination
    const totalLogs = await logsCollection.countDocuments(query);
    
    // Fetch logs with pagination
    const logs = await logsCollection.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    
    await client.close();

    // Format and return the logs
    return NextResponse.json({
      logs,
      pagination: {
        total: totalLogs,
        page,
        limit,
        pages: Math.ceil(totalLogs / limit)
      }
    });
    
  } catch (error) {
    console.error('Error retrieving logs:', error);
    return NextResponse.json(
      { error: 'An error occurred while retrieving logs' },
      { status: 500 }
    );
  }
} 