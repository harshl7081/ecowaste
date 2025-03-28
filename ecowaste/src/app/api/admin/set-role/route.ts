import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    console.log("Set role API called");
    
    // Get the current user
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      console.error("No authenticated user found");
      return NextResponse.json({ 
        error: "Unauthorized",
        message: "You must be logged in to perform this action" 
      }, { status: 401 });
    }

    console.log(`Request from user: ${clerkUser.id}`);

    // Check MongoDB connection status before proceeding
    const isConnected = mongoose.connection.readyState === 1;
    if (!isConnected) {
      console.log("MongoDB not connected, trying to connect now...");
      // Connect to MongoDB
      await connectDB();
      
      // Check connection again
      const nowConnected = mongoose.connection.readyState === 1;
      if (!nowConnected) {
        throw new Error("Failed to establish MongoDB connection");
      }
    }

    // Check if the current user is an admin
    const adminUser = await User.findOne({ clerkId: clerkUser.id });
    
    if (!adminUser || adminUser.role !== 'admin') {
      console.error(`User ${clerkUser.id} is not an admin`);
      return NextResponse.json({ 
        error: "Forbidden",
        message: "You must be an admin to perform this action" 
      }, { status: 403 });
    }

    // Parse the request body
    const data = await req.json();
    const { userId, role } = data;
    
    console.log(`Attempting to set role for user ${userId} to ${role}`);
    
    if (!userId || !role || !['user', 'admin'].includes(role)) {
      return NextResponse.json({ 
        error: "Bad Request",
        message: "Invalid user ID or role"
      }, { status: 400 });
    }

    // Get the target user
    const targetUser = await User.findOne({ clerkId: userId });
    
    if (!targetUser) {
      return NextResponse.json({ 
        error: "Not Found",
        message: "User not found" 
      }, { status: 404 });
    }
    
    // Update the user's role
    targetUser.role = role;
    targetUser.updatedAt = new Date();
    await targetUser.save();
    
    console.log(`Successfully updated user ${userId} role to ${role}`);
    
    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        id: targetUser._id,
        clerkId: targetUser.clerkId,
        name: `${targetUser.firstName} ${targetUser.lastName}`,
        email: targetUser.email,
        role: targetUser.role
      }
    });
  } catch (error) {
    console.error("Error setting user role:", error);
    
    return NextResponse.json({
      error: "Internal Server Error",
      message: "Failed to update user role",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 