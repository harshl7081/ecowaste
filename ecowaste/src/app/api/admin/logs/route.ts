import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/sync-user';
import connectDB from '@/lib/mongodb';
import Log from '@/models/Log';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and admin
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin status
    const adminStatus = await isAdmin(user.id);
    if (!adminStatus) {
      logger.warning(`Non-admin user ${user.id} attempted to access logs`, {
        userId: user.id,
        route: '/api/admin/logs',
      });
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Connect to MongoDB
    await connectDB();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get('level');
    const userId = searchParams.get('userId');
    const route = searchParams.get('route');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (level) query.level = level;
    if (userId) query.userId = userId;
    if (route) query.route = { $regex: route, $options: 'i' };
    
    // Date range
    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }

    // Get total count for pagination
    const total = await Log.countDocuments(query);

    // Get logs with pagination
    const logs = await Log.find(query)
      .sort({ timestamp: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .lean();

    // Log the access
    logger.info(`Admin ${user.id} accessed logs`, {
      userId: user.id,
      route: '/api/admin/logs',
      data: { query, page, limit },
    });

    return NextResponse.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    logger.error(`Error fetching logs: ${error instanceof Error ? error.message : String(error)}`, {
      route: '/api/admin/logs',
      error: error instanceof Error ? error.stack : String(error),
    });
    
    return NextResponse.json(
      { error: 'An error occurred while retrieving logs' },
      { status: 500 }
    );
  }
} 