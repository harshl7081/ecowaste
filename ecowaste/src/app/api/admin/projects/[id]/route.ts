import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { currentUser } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/sync-user';

// Database connection
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'ecowaste';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get project ID from params
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { status, adminComment } = body;

    // Validate status
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
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

    // Create update object
    const updateData: Record<string, any> = {
      status,
      updatedAt: new Date()
    };

    // Include admin comment if provided
    if (adminComment) {
      updateData.adminComment = adminComment;
    }

    // Update project
    const result = await projectsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    await client.close();

    // Check if project was found and updated
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    console.log(`Updated project ${id} status to ${status}`);

    // If project is approved and set to public or moderated, notify the user
    // This would typically involve sending an email, but for now we just log it
    if (status === 'approved') {
      console.log(`Project ${id} has been approved. User should be notified.`);
      // TODO: Implement notification system
    }

    return NextResponse.json({
      success: true,
      message: `Project status updated to ${status}`,
    });
    
  } catch (error) {
    console.error('Error updating project status:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the project' },
      { status: 500 }
    );
  }
} 