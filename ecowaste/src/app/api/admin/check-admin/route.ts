import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }
    
    // Verify admin status
    const adminStatus = await isAdmin(user.id);
    
    return NextResponse.json({ isAdmin: adminStatus });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
} 