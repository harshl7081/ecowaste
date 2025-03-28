import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { currentUser } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/sync-user';

// Database connection
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'ecowaste';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and admin
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin status
    const adminStatus = await isAdmin(user.id);
    if (!adminStatus) {
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
    
    console.log(`Fetched ${projects.length} projects with filters: ${JSON.stringify(query)}`);
    
    return NextResponse.json({ projects });
    
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'An error occurred while retrieving projects' },
      { status: 500 }
    );
  }
} 