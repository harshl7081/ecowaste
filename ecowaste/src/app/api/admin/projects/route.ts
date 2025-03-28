import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { currentUser } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/sync-user';
import { withLogging } from '@/lib/api-logger';
import logger from '@/lib/logger';

// Database connection
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'ecowaste';

// Original handler function
async function getProjectsHandler(request: NextRequest) {
  try {
    // Check if user is authenticated and admin
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin status
    const adminStatus = await isAdmin(user.id);
    if (!adminStatus) {
      logger.warning(`Non-admin user ${user.id} attempted to access admin projects`, {
        userId: user.id,
        route: '/api/admin/projects',
      });
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

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
    const projectsCollection = db.collection('projects');
    
    // Build query based on status filter
    const query = status ? { status } : {};
    
    // Fetch projects and sort by creation date (newest first)
    const projects = await projectsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    await client.close();
    
    logger.info(`Admin ${user.id} fetched ${projects.length} projects`, {
      userId: user.id,
      route: '/api/admin/projects',
      data: { filters: query, count: projects.length },
    });
    
    return NextResponse.json({ projects });
    
  } catch (error) {
    logger.error(`Error fetching projects: ${error instanceof Error ? error.message : String(error)}`, {
      route: '/api/admin/projects',
      error: error instanceof Error ? error.stack : String(error),
    });
    
    return NextResponse.json(
      { error: 'An error occurred while retrieving projects' },
      { status: 500 }
    );
  }
}

// Use the logging middleware
export function GET(request: NextRequest) {
  return withLogging(request, getProjectsHandler, '/api/admin/projects');
} 