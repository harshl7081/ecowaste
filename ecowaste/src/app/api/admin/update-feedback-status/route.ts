import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Feedback from '@/models/Feedback';
import { currentUser } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/sync-user';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and an admin
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify admin status
    const adminStatus = await isAdmin(user.id);
    if (!adminStatus) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Parse the request body
    const { feedbackId, status, adminComment } = await request.json();

    if (!feedbackId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Connect to database
    await connectDB();

    // Update feedback status
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { 
        status, 
        adminComment, 
        updatedAt: new Date() 
      },
      { new: true }
    );

    if (!updatedFeedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      feedback: updatedFeedback 
    });
  } catch (error) {
    console.error('Error updating feedback status:', error);
    return NextResponse.json({ error: 'Failed to update feedback status' }, { status: 500 });
  }
} 