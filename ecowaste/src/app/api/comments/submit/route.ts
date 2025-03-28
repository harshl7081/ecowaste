import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Comment from "@/models/Comment";
import Project from "@/models/Project";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    console.log("Submit comment API called");
    
    // Get the current user
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      console.error("No authenticated user found");
      return NextResponse.json({ 
        error: "Unauthorized",
        message: "You must be logged in to comment" 
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

    // Parse request body
    const data = await req.json();
    const { projectId, content } = data;

    // Validate required fields
    if (!projectId || !content) {
      return NextResponse.json({
        error: "Bad Request",
        message: "Project ID and comment content are required"
      }, { status: 400 });
    }

    // Check if project exists and is visible
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({
        error: "Not Found",
        message: "Project not found"
      }, { status: 404 });
    }

    // Create the comment
    const comment = new Comment({
      projectId,
      userId: clerkUser.id,
      userEmail: clerkUser.emailAddresses[0]?.emailAddress,
      userName: `${clerkUser.firstName} ${clerkUser.lastName}`,
      content,
      status: 'pending', // All comments start as pending
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await comment.save();
    
    console.log(`Comment created for project ${projectId}`);
    
    return NextResponse.json({
      success: true,
      message: "Comment submitted successfully and awaiting moderation",
      comment: {
        id: comment._id,
        content: comment.content,
        status: comment.status,
        createdAt: comment.createdAt
      }
    });
  } catch (error) {
    console.error("Error submitting comment:", error);
    
    return NextResponse.json({
      error: "Internal Server Error",
      message: "Failed to submit comment",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 