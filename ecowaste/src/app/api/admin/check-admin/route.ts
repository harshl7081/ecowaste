import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/sync-user';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }
    
    // Verify admin status
    const adminStatus = await isAdmin(user.id);
    
    // Log the admin check
    logger.info(`Admin status check for user ${user.id}: ${adminStatus}`, {
      userId: user.id,
      route: '/api/admin/check-admin',
      data: { isAdmin: adminStatus }
    });
    
    return NextResponse.json({ isAdmin: adminStatus });
  } catch (error) {
    console.error('Error checking admin status:', error);
    logger.error(`Error checking admin status: ${error instanceof Error ? error.message : String(error)}`, {
      route: '/api/admin/check-admin',
      error: error instanceof Error ? error.stack : String(error)
    });
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
} 