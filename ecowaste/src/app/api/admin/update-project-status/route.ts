import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

// Define Project model (this would normally be in a separate model file)
let Project;

try {
  Project = mongoose.model('Project');
} catch {
  const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
      type: String, 
      required: true,
      enum: ['segregation', 'disposal', 'sanitization', 'other']
    },
    location: { type: String, required: true },
    budget: { type: Number, required: true },
    timeline: { type: String, required: true },
    contactName: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: false },
    userId: { type: String, required: true },
    userEmail: { type: String, required: true },
    status: { 
      type: String, 
      default: 'pending',
      enum: ['pending', 'approved', 'in_progress', 'completed', 'rejected']
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });

  Project = mongoose.model('Project', ProjectSchema);
}

export async function POST(req: NextRequest) {
  try {
    console.log("Admin update-project-status API called");
    
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

    // Parse request body
    const data = await req.json();
    const { projectId, status } = data;

    // Validate required fields
    if (!projectId || !status) {
      return NextResponse.json({
        error: "Bad Request",
        message: "Project ID and status are required"
      }, { status: 400 });
    }

    // Validate status value
    const validStatuses = ['pending', 'approved', 'in_progress', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        error: "Bad Request",
        message: "Invalid status value"
      }, { status: 400 });
    }

    // Update project status
    const project = await Project.findByIdAndUpdate(
      projectId,
      { 
        status,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!project) {
      return NextResponse.json({
        error: "Not Found",
        message: "Project not found"
      }, { status: 404 });
    }

    console.log(`Successfully updated project ${projectId} status to ${status}`);
    
    return NextResponse.json({
      success: true,
      message: "Project status updated successfully",
      project
    });
  } catch (error) {
    console.error("Error updating project status:", error);
    
    return NextResponse.json({
      error: "Internal Server Error",
      message: "Failed to update project status",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 