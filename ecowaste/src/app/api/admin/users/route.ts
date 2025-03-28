import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { Clerk } from '@clerk/clerk-sdk-node';
import { isAdmin } from '@/lib/auth';

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
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check if Clerk API key is available
    if (!process.env.CLERK_SECRET_KEY) {
      console.warn('CLERK_SECRET_KEY is not defined. Using mock data.');
      return getMockUsers(user);
    }

    try {
      // Initialize Clerk client with the secret key
      const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });
      
      // Fetch users from Clerk
      const clerkUsers = await clerk.users.getUserList({
        limit: 100,
      });

      // Format users for response
      const users = clerkUsers.map((clerkUser) => {
        const primaryEmail = clerkUser.emailAddresses.find(
          (email) => email.id === clerkUser.primaryEmailAddressId
        )?.emailAddress;

        return {
          id: clerkUser.id,
          email: primaryEmail || 'No email found',
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
          lastSignIn: clerkUser.lastSignInAt,
          // Determine if user is admin
          role: clerkUser.id === user.id || clerkUser.id === process.env.ADMIN_USER_ID ? 'admin' : 'user',
        };
      });

      return NextResponse.json({ users });
    } catch (clerkError) {
      console.error('Error fetching users from Clerk:', clerkError);
      return getMockUsers(user);
    }
  } catch (error) {
    console.error('Error in admin users endpoint:', error);
    return NextResponse.json(
      { error: 'An error occurred while retrieving users' },
      { status: 500 }
    );
  }
}

// Helper function to return mock users when Clerk API fails
function getMockUsers(currentUser: any) {
  // Create a list with the current user and some mock users
  const mockUsers = [
    // Current authenticated user
    {
      id: currentUser.id,
      email: currentUser.emailAddresses[0]?.emailAddress || 'No email found',
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      imageUrl: currentUser.imageUrl,
      lastSignIn: new Date().toISOString(),
      role: 'admin'
    },
    // Mock admin user from environment
    {
      id: process.env.ADMIN_USER_ID || 'mock_admin_id',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      lastSignIn: new Date().toISOString(),
      role: 'admin'
    },
    // Mock regular users
    {
      id: 'mock_user_1',
      email: 'user1@example.com',
      firstName: 'John',
      lastName: 'Doe',
      lastSignIn: new Date().toISOString(),
      role: 'user'
    },
    {
      id: 'mock_user_2',
      email: 'user2@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      lastSignIn: new Date().toISOString(),
      role: 'user'
    }
  ];
  
  return NextResponse.json({ 
    users: mockUsers,
    warning: "Using mock user data because Clerk API is unavailable"
  });
} 