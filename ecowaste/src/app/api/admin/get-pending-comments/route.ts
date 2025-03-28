import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Comment from "@/models/Comment";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    console.log("Get pending comments API called");
    
    // Get the current user
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      console.error("No authenticated user found");
      return NextResponse.json({ 
        error: "Unauthorized",
        message: "You must be logged in to access this endpoint" 
      }, { status: 401 });
    }

    // Check MongoDB connection
    const isConnected = mongoose.connection.readyState === 1;
    if (!isConnected) {
      console.log("MongoDB not connected, trying to connect now...");
      await connectDB();
      
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
        message: "You must be an admin to view pending comments" 
      }, { status: 403 });
    }

    // Get all pending comments
    const comments = await Comment.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    
    console.log(`Found ${comments.length} pending comments`);
    
    return NextResponse.json({
      success: true,
      comments: comments.map(comment => ({
        id: comment._id,
        content: comment.content,
        userName: comment.userName,
        status: comment.status,
        createdAt: comment.createdAt,
        projectId: comment.projectId
      }))
    });
  } catch (error) {
    console.error("Error getting pending comments:", error);
    
    return NextResponse.json({
      error: "Internal Server Error",
      message: "Failed to get pending comments",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 