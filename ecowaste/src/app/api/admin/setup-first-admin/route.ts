import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import mongoose from "mongoose";

// This endpoint is used to create the first admin user
// It should only work if there are no admin users in the system
export async function POST(req: NextRequest) {
  try {
    console.log("Setup first admin API called");
    
    // Get the current user
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      console.error("No authenticated user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`Setting up admin for user: ${clerkUser.id}`);

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
    
    console.log("Connected to MongoDB");
    
    // Check if any admin users exist
    const adminCount = await User.countDocuments({ role: 'admin' });
    console.log(`Found ${adminCount} existing admin users`);
    
    if (adminCount > 0) {
      return NextResponse.json(
        { error: "Admin users already exist. Use the admin panel to manage roles." },
        { status: 400 }
      );
    }
    
    // Try to create a new User directly without checking if it exists first
    try {
      console.log("Creating new admin user directly");
      const userData = {
        clerkId: clerkUser.id,
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        imageUrl: clerkUser.imageUrl || "",
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      console.log("User data:", userData);
      
      // Use findOneAndUpdate with upsert to create/update the user
      const result = await User.findOneAndUpdate(
        { clerkId: clerkUser.id },
        { $set: userData },
        { upsert: true, new: true }
      );
      
      console.log(`Admin user created/updated with MongoDB ID: ${result._id}`);
      
      return NextResponse.json({
        message: "First admin user created successfully",
        userId: clerkUser.id,
        mongoId: result._id.toString()
      });
    } catch (createError) {
      console.error("Error creating admin user:", createError);
      throw createError;
    }
  } catch (error) {
    console.error("Error setting up first admin:", error);
    
    // Return more detailed error information
    return NextResponse.json(
      { 
        error: "Failed to set up admin user",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 