import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

// Define a schema for waste management projects
// (This would normally be in a separate model file)
let Project;

try {
  // Try to get the existing model
  Project = mongoose.model('Project');
} catch (error) {
  // If the model doesn't exist, create it
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
    console.log("Waste management project submission API called");
    
    // Get the current user
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      console.error("No authenticated user found");
      return NextResponse.json({ 
        error: "Unauthorized",
        message: "You must be logged in to submit a project proposal" 
      }, { status: 401 });
    }

    console.log(`Project submission from user: ${clerkUser.id}`);

    // Check MongoDB connection status before proceeding
    const isConnected = mongoose.connection.readyState === 1;
    if (!isConnected) {
      console.log("MongoDB not connected, trying to connect now...");
      await connectDB();
      
      const nowConnected = mongoose.connection.readyState === 1;
      if (!nowConnected) {
        throw new Error("Failed to establish MongoDB connection");
      }
    }

    // Parse the request body
    const data = await req.json();
    
    // Validate required fields
    const requiredFields = [
      'title', 'description', 'category', 'location', 
      'budget', 'timeline', 'contactName', 'contactEmail'
    ];
    
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: "Bad Request",
        message: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Create a new project
    const project = new Project({
      ...data,
      userId: clerkUser.id,
      userEmail: clerkUser.emailAddresses[0]?.emailAddress || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Save the project to the database
    await project.save();
    
    console.log(`Successfully saved project proposal: ${project._id}`);
    
    return NextResponse.json({
      success: true,
      message: "Project proposal submitted successfully",
      projectId: project._id
    });
  } catch (error) {
    console.error("Error submitting project proposal:", error);
    
    return NextResponse.json({
      error: "Internal Server Error",
      message: "Failed to submit project proposal",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 