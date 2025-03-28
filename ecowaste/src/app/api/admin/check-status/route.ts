import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Check if any admin users exist
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    return NextResponse.json({
      status: "success",
      adminCount
    });
  } catch (error) {
    console.error("Error checking admin status:", error);
    
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 