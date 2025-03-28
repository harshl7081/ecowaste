import { User as ClerkUser } from "@clerk/nextjs/server";
import connectDB from "./mongodb";
import User from "@/models/User";

export async function syncUserToDatabase(clerkUser: ClerkUser, role?: string) {
  try {
    await connectDB();

    // Check if user already exists to preserve role
    const existingUser = await User.findOne({ clerkId: clerkUser.id });
    
    // If role is provided, use it; otherwise use existing role or default to 'user'
    const userRole = role || (existingUser?.role || 'user');

    // Use findOneAndUpdate with upsert to avoid duplicate key errors
    const result = await User.findOneAndUpdate(
      { clerkId: clerkUser.id },
      {
        $set: {
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          imageUrl: clerkUser.imageUrl,
          role: userRole, // Set the role
          updatedAt: new Date(),
        },
        // If the document doesn't exist, set the createdAt field
        $setOnInsert: {
          createdAt: new Date(),
        }
      },
      {
        upsert: true, // Create the document if it doesn't exist
        new: true, // Return the updated document
      }
    );

    return result._id;
  } catch (error) {
    console.error("Failed to sync user to MongoDB:", error);
    throw error;
  }
}

// Function to set a user as admin
export async function setUserAsAdmin(clerkId: string) {
  try {
    await connectDB();
    const result = await User.findOneAndUpdate(
      { clerkId },
      { $set: { role: 'admin' } },
      { new: true }
    );
    return result;
  } catch (error) {
    console.error("Failed to set user as admin:", error);
    throw error;
  }
}

// Function to check if a user is an admin
export async function isAdmin(clerkId: string): Promise<boolean> {
  try {
    await connectDB();
    const user = await User.findOne({ clerkId });
    return user?.role === 'admin';
  } catch (error) {
    console.error("Failed to check admin status:", error);
    return false;
  }
} 