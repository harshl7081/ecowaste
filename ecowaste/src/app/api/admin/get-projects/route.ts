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

export async function GET(req: NextRequest) {
  try {
    console.log("Admin get-projects API called");
    
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

    // Get all projects, sorted by creation date (newest first)
    const projects = await Project.find({})
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    
    console.log(`Successfully fetched ${projects.length} projects`);
    
    return NextResponse.json({
      success: true,
      projects
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    
    return NextResponse.json({
      error: "Internal Server Error",
      message: "Failed to fetch projects",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 