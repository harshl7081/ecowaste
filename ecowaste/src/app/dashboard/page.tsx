import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { syncUserToDatabase } from "@/lib/sync-user";
import { checkAdmin } from "@/lib/auth-utils";

export default async function Dashboard() {
  // Get the current user from Clerk
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">You need to be signed in to view this page.</p>
          <Link href="/sign-in" className="text-blue-500 hover:text-blue-700 underline">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Connect to MongoDB
  await connectDB();
  
  // Find user data in MongoDB (if exists)
  let mongoUser = await User.findOne({ clerkId: clerkUser.id });
  
  // If user doesn't exist in MongoDB, sync them
  if (!mongoUser) {
    try {
      await syncUserToDatabase(clerkUser);
      // Fetch the user again after syncing
      mongoUser = await User.findOne({ clerkId: clerkUser.id });
    } catch (error) {
      console.error("Error syncing user:", error);
    }
  }

  // Check if user is admin
  const isUserAdmin = await checkAdmin();
  
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-blue-500 hover:text-blue-700 underline">
              Home
            </Link>
            {isUserAdmin && (
              <Link href="/admin" className="text-purple-500 hover:text-purple-700 underline font-semibold">
                Admin Panel
              </Link>
            )}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Clerk ID</p>
              <p className="font-medium">{clerkUser.id}</p>
            </div>
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-medium">{clerkUser.firstName} {clerkUser.lastName}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{clerkUser.emailAddresses[0]?.emailAddress}</p>
            </div>
            {mongoUser && (
              <div>
                <p className="text-gray-600">Role</p>
                <p className="font-medium">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    mongoUser.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {mongoUser.role}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">MongoDB Data</h2>
          {mongoUser ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">MongoDB ID</p>
                <p className="font-medium">{mongoUser._id.toString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Clerk ID (in MongoDB)</p>
                <p className="font-medium">{mongoUser.clerkId}</p>
              </div>
              <div>
                <p className="text-gray-600">Name (in MongoDB)</p>
                <p className="font-medium">{mongoUser.firstName} {mongoUser.lastName}</p>
              </div>
              <div>
                <p className="text-gray-600">Created At</p>
                <p className="font-medium">{new Date(mongoUser.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
              <p>Failed to sync user data to MongoDB.</p>
              <p className="text-sm mt-2">
                Please check your MongoDB connection and try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 