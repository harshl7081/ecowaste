import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { currentUser } from '@clerk/nextjs/server';

// Database connection
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'ecowaste';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
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
    const projectsCollection = db.collection('projects');
    
    // Fetch projects for the current user and sort by creation date (newest first)
    const projects = await projectsCollection
      .find({ userId: user.id })
      .sort({ createdAt: -1 })
      .toArray();
    
    await client.close();
    
    console.log(`Fetched ${projects.length} projects for user ${user.id}`);
    
    return NextResponse.json({ projects });
    
  } catch (error) {
    console.error('Error fetching user projects:', error);
    return NextResponse.json(
      { error: 'An error occurred while retrieving your projects' },
      { status: 500 }
    );
  }
} 