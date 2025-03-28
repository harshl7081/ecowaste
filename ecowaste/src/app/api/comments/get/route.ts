import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Comment from "@/models/Comment";
import Project from "@/models/Project";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    console.log("Get comments API called");
    
    // Get the current user
    const clerkUser = await currentUser();
    
    // Get projectId from URL
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({
        error: "Bad Request",
        message: "Project ID is required"
      }, { status: 400 });
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

    // Get the project
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({
        error: "Not Found",
        message: "Project not found"
      }, { status: 404 });
    }

    // Check if user can view comments
    let canViewPendingComments = false;
    if (clerkUser) {
      // Check if user is admin or project owner
      const user = await User.findOne({ clerkId: clerkUser.id });
      canViewPendingComments = user?.role === 'admin' || project.userId === clerkUser.id;
    }

    // Get comments based on visibility
    let comments;
    if (canViewPendingComments) {
      // Get all comments if admin or project owner
      comments = await Comment.find({ projectId }).sort({ createdAt: -1 });
    } else {
      // Get only approved comments for regular users
      comments = await Comment.find({ 
        projectId,
        status: 'approved'
      }).sort({ createdAt: -1 });
    }
    
    return NextResponse.json({
      success: true,
      comments: comments.map(comment => ({
        id: comment._id,
        content: comment.content,
        userName: comment.userName,
        status: comment.status,
        createdAt: comment.createdAt,
        isOwner: clerkUser && comment.userId === clerkUser.id
      }))
    });
  } catch (error) {
    console.error("Error getting comments:", error);
    
    return NextResponse.json({
      error: "Internal Server Error",
      message: "Failed to get comments",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 