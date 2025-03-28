import { NextRequest, NextResponse } from "next/server";
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

type WebhookEvent = {
  data: {
    id: string;
    first_name?: string;
    last_name?: string;
    email_addresses?: Array<{ email_address: string }>;
    image_url?: string;
  };
  type: string;
};

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return new NextResponse('Webhook secret not set', { status: 500 });
  }

  try {
    // Get the headers (async in Next.js 15)
    const headersList = await headers();
    const svix_id = headersList.get("svix-id");
    const svix_timestamp = headersList.get("svix-timestamp");
    const svix_signature = headersList.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new NextResponse('Missing required Svix headers', { status: 400 });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret
    const wh = new Webhook(WEBHOOK_SECRET);

    // Verify the payload with the headers
    const evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;

    // Connect to the database
    await connectDB();

    // Handle the webhook
    const eventType = evt.type;
    const { id } = evt.data;

    // Handle user creation and updates
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { first_name, last_name, email_addresses, image_url } = evt.data;

      // First check if the user already exists to preserve role
      const existingUser = await User.findOne({ clerkId: id });
      const userRole = existingUser?.role || 'user';

      // Use findOneAndUpdate with upsert to avoid duplicate key errors
      await User.findOneAndUpdate(
        { clerkId: id },
        {
          $set: {
            firstName: first_name,
            lastName: last_name,
            email: email_addresses?.[0]?.email_address,
            imageUrl: image_url,
            role: userRole, // Preserve the role
            updatedAt: new Date(),
          },
          // If the document doesn't exist, set the createdAt field
          $setOnInsert: {
            createdAt: new Date(),
          }
        },
        {
          upsert: true, // Create the document if it doesn't exist
          new: true, // Return the updated document
        }
      );
    }
    
    // Handle user deletion as a separate case
    else if (eventType === 'user.deleted') {
      await User.deleteOne({ clerkId: id });
    }

    return NextResponse.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Error processing webhook', { status: 500 });
  }
} 