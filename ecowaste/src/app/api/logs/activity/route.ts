import { NextRequest, NextResponse } from 'next/server';
import { LogAction } from '@/lib/logger';
import { logActivity } from '@/lib/server-logger';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Get user ID if authenticated
    const user = await currentUser();
    const userId = user?.id;
    
    // Get client IP address from headers or request
    const ip = request.headers.get('x-forwarded-for') || 
      request.headers.get('x-real-ip') || 
      'unknown';
    
    // Parse log data from request
    const data = await request.json();
    const { action, path, elementId, elementText, details, userAgent } = data;
    
    // Validate required fields
    if (!action || !path) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Log the activity
    const result = await logActivity({
      userId,
      action: action as LogAction,
      path,
      elementId,
      elementText,
      details,
      userAgent,
      ip: Array.isArray(ip) ? ip[0] : ip
    });
    
    if (!result.success) {
      console.warn('Failed to log activity:', result.reason);
      // Return success anyway to not disrupt user experience
      return NextResponse.json({ success: true, message: 'Log received but not stored', reason: result.reason });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing activity log:', error);
    // Still return success to avoid disrupting user experience
    return NextResponse.json({ success: true, message: 'Log received but processing failed' });
  }
} 