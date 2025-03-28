import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Feedback from '@/models/Feedback';
import { currentUser } from '@clerk/nextjs/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Generate a random filename for the image
const generateFileName = (bytes = 16) => crypto.randomBytes(bytes).toString('hex');

export async function POST(request: NextRequest) {
  try {
    // Get current user information
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const address = formData.get('address') as string;
    const lat = parseFloat(formData.get('lat') as string);
    const lng = parseFloat(formData.get('lng') as string);
    const severity = formData.get('severity') as string;
    const imageFile = formData.get('image') as File;

    // Validate inputs
    if (!title || !description || !address || !lat || !lng || !imageFile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate a unique filename
    const fileName = generateFileName();
    const fileExtension = imageFile.name.split('.').pop();
    const fullFileName = `${fileName}.${fileExtension}`;
    const relativeUploadDir = '/feedback-images';
    const uploadDir = path.join(process.cwd(), 'public', relativeUploadDir);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Convert file to buffer and save to disk
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const filePath = path.join(uploadDir, fullFileName);
    fs.writeFileSync(filePath, buffer);
    
    // The public URL for the image
    const imageUrl = `${relativeUploadDir}/${fullFileName}`;

    // Connect to database
    await connectDB();

    // Create feedback entry
    const feedback = await Feedback.create({
      title,
      description,
      location: {
        address,
        coordinates: { lat, lng }
      },
      imageUrl,
      userId: user.id,
      userEmail: user.emailAddresses[0].emailAddress,
      severity,
      status: 'pending',
    });

    return NextResponse.json({ success: true, feedback }, { status: 201 });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
} 