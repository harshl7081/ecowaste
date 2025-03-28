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

    const userId = user.id;

    // Connect to MongoDB
    if (!uri) {
      console.warn('Database connection string not configured');
      return getMockUserProjects(userId);
    }

    try {
      const client = new MongoClient(uri);
      await client.connect();
      
      const db = client.db(dbName);
      const projectsCollection = db.collection('projects');
      
      // Fetch projects for the current user and sort by creation date (newest first)
      const projects = await projectsCollection
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray();
      
      await client.close();
      
      console.log(`Fetched ${projects.length} projects for user ${userId}`);
      
      return NextResponse.json({ projects });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return getMockUserProjects(userId);
    }
    
  } catch (error) {
    console.error('Error fetching user projects:', error);
    return NextResponse.json(
      { error: 'An error occurred while retrieving your projects' },
      { status: 500 }
    );
  }
}

// Helper function to return mock projects when the database is unavailable
function getMockUserProjects(userId: string) {
  const mockProjects = [
    {
      _id: "mock_project_1",
      title: "Community Waste Segregation",
      description: "A project to implement waste segregation in residential communities",
      category: "segregation",
      location: "Downtown Area",
      budget: 5000,
      timeline: "3 months",
      status: "pending",
      visibility: "public",
      userId: userId,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: "mock_project_2",
      title: "School Recycling Program",
      description: "Implementing recycling stations in local schools",
      category: "disposal",
      location: "School District",
      budget: 3200,
      timeline: "2 months",
      status: "approved",
      visibility: "public",
      userId: userId,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: "mock_project_3",
      title: "Park Cleanup Initiative",
      description: "Regular cleanup and waste management in city parks",
      category: "sanitization",
      location: "Central Park",
      budget: 1800,
      timeline: "Ongoing",
      status: "rejected",
      visibility: "private",
      userId: userId,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
      adminComment: "Budget seems insufficient for the scope of work"
    }
  ];
  
  return NextResponse.json({ 
    projects: mockProjects,
    warning: "Using mock project data because database is unavailable"
  });
} 