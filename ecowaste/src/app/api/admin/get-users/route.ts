import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    // Get the current user
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectDB();
    
    // Check if the current user is an admin
    const adminUser = await User.findOne({ clerkId: clerkUser.id });
    
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json(
        { error: "Not authorized as admin" },
        { status: 403 }
      );
    }
    
    // Get all users
    const users = await User.find().sort({ createdAt: -1 });
    
    return NextResponse.json({
      users: users.map(user => ({
        _id: user._id.toString(),
        clerkId: user.clerkId,
        email: user.email || '',
        role: user.role
      }))
    });
  } catch (error) {
    console.error("Error getting users:", error);
    
    return NextResponse.json({
      error: "Failed to get users",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 