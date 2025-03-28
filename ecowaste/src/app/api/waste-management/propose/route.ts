import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { currentUser } from '@clerk/nextjs/server';

// Connection URI
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'ecowaste';

// Define types for project proposal
type ProjectVisibility = 'public' | 'private' | 'moderated';
type ProjectCategory = 'segregation' | 'disposal' | 'sanitization' | 'other';

interface ProjectProposal {
  title: string;
  description: string;
  category: ProjectCategory;
  location: string;
  budget: number;
  timeline: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  visibility: ProjectVisibility;
  userId: string;
  userEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Basic validation
    if (!body.title || !body.description || !body.category || !body.location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
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
    
    // Get user email
    const primaryEmail = user.emailAddresses[0].emailAddress;

    // Prepare project data
    const now = new Date();
    const projectData: ProjectProposal = {
      title: body.title,
      description: body.description,
      category: body.category,
      location: body.location,
      budget: body.budget,
      timeline: body.timeline,
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      visibility: body.visibility,
      userId: user.id,
      userEmail: primaryEmail,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    // Save to database
    const db = client.db(dbName);
    const projectsCollection = db.collection('projects');
    const result = await projectsCollection.insertOne(projectData);
    
    await client.close();

    // Return success
    return NextResponse.json({
      success: true,
      message: 'Project proposal submitted successfully',
      projectId: result.insertedId,
    });

  } catch (error) {
    console.error('Error submitting project proposal:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 