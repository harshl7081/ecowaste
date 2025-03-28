import { NextRequest, NextResponse } from 'next/server';
import { auth as clerkAuth, clerkClient } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    // Fetch users from Clerk
    const clerkUsers = await clerkClient.users.getUserList({
      limit: 100,
    });

    // Format users for response
    const users = clerkUsers.map((user) => {
      const primaryEmail = user.emailAddresses.find(
        (email) => email.id === user.primaryEmailAddressId
      )?.emailAddress;

      return {
        id: user.id,
        email: primaryEmail || 'No email found',
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        lastSignIn: user.lastSignInAt,
        // Determine if user is admin - for this example, we're using our isAdmin function
        // In a real app, you might store role information in a database
        role: user.id === userId || user.id === process.env.ADMIN_USER_ID ? 'admin' : 'user',
      };
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'An error occurred while retrieving users' },
      { status: 500 }
    );
  }
} 