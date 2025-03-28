import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ 
        error: "Not authenticated",
        authenticated: false,
        userId: null,
        adminIds: [process.env.ADMIN_USER_ID || 'user_2bLCcUosPl1mCH3UW5kNoMahkRj']
      }, { status: 401 });
    }
    
    // Verify admin status
    const adminStatus = await isAdmin(user.id);
    
    return NextResponse.json({ 
      authenticated: true,
      userId: user.id,
      adminIds: [process.env.ADMIN_USER_ID || 'user_2bLCcUosPl1mCH3UW5kNoMahkRj'],
      isAdmin: adminStatus
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json({ 
      error: "Server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 