import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET() {
  try {
    // Attempt to connect to MongoDB
    const connection = await connectDB();
    
    // Check if we have a valid connection
    const isConnected = mongoose.connection.readyState === 1;
    
    return NextResponse.json({
      status: "success",
      connected: isConnected,
      databaseName: connection?.name || "unknown",
      collections: isConnected ? 
        (await mongoose.connection.db.listCollections().toArray()).map(c => c.name) : 
        []
    });
  } catch (error) {
    console.error("MongoDB connection test failed:", error);
    
    return NextResponse.json({
      status: "error",
      message: "Failed to connect to MongoDB",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 