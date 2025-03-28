import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Comment from "@/models/Comment";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    console.log("Moderate comment API called");
    
    // Get the current user
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      console.error("No authenticated user found");
      return NextResponse.json({ 
        error: "Unauthorized",
        message: "You must be logged in to moderate comments" 
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
        message: "You must be an admin to moderate comments" 
      }, { status: 403 });
    }

    // Parse request body
    const data = await req.json();
    const { commentId, status } = data;

    // Validate required fields
    if (!commentId || !status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({
        error: "Bad Request",
        message: "Comment ID and valid status are required"
      }, { status: 400 });
    }

    // Update the comment status
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { 
        status,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!comment) {
      return NextResponse.json({
        error: "Not Found",
        message: "Comment not found"
      }, { status: 404 });
    }
    
    console.log(`Comment ${commentId} status updated to ${status}`);
    
    return NextResponse.json({
      success: true,
      message: `Comment ${status}`,
      comment: {
        id: comment._id,
        content: comment.content,
        status: comment.status,
        updatedAt: comment.updatedAt
      }
    });
  } catch (error) {
    console.error("Error moderating comment:", error);
    
    return NextResponse.json({
      error: "Internal Server Error",
      message: "Failed to moderate comment",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 