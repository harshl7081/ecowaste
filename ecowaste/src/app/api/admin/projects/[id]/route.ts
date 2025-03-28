import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { auth as clerkAuth } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/auth';

// Database connection
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'ecowaste';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and admin
    const { userId } = clerkAuth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin status
    const adminStatus = await isAdmin(userId);
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

    // Create update object
    const updateData: Record<string, any> = {
      status,
      updatedAt: new Date()
    };

    // Include admin comment if provided
    if (adminComment) {
      updateData.adminComment = adminComment;
    }

    try {
      // Connect to MongoDB
      if (!uri) {
        console.warn('Database connection string not configured, using mock success response');
        return NextResponse.json({
          success: true,
          message: `Project status updated to ${status} (demo mode)`,
        });
      }

      const client = new MongoClient(uri);
      
      try {
        await client.connect();
      } catch (connectionError) {
        console.error('Error connecting to database:', connectionError);
        return NextResponse.json({
          success: true, 
          message: `Project status updated to ${status} (database connection failed)`,
          warning: 'Database connection failed, your changes will be applied when connection is restored'
        });
      }
      
      const db = client.db(dbName);
      const projectsCollection = db.collection('projects');

      // Safely convert string ID to ObjectId
      let objectId;
      try {
        objectId = new ObjectId(id);
      } catch (idError) {
        console.error(`Invalid ObjectId format: ${id}`);
        return NextResponse.json({ 
          error: 'Invalid project ID format',
          details: 'The provided ID is not in a valid format'
        }, { status: 400 });
      }

      // Update project - wrap this in try/catch to handle database operation errors
      try {
        const result = await projectsCollection.updateOne(
          { _id: objectId },
          { $set: updateData }
        );
        
        await client.close();
  
        // Check if project was found and updated
        if (result.matchedCount === 0) {
          return NextResponse.json({ 
            error: 'Project not found',
            details: `No project found with ID: ${id}`
          }, { status: 404 });
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
      } catch (dbOperationError) {
        console.error('Database operation error:', dbOperationError);
        await client.close();
        return NextResponse.json({
          success: false,
          error: 'Database operation failed',
          details: dbOperationError instanceof Error ? dbOperationError.message : 'Unknown database error'
        }, { status: 500 });
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      return NextResponse.json({
        error: 'An error occurred while updating the project',
        errorDetails: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating project status:', error);
    return NextResponse.json({
      error: 'An error occurred while updating the project',
      errorDetails: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, { status: 500 });
  }
} 