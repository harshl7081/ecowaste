"use client";

import { useEffect, useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function AdminSetup() {
  const { isLoaded, user } = useUser();
  const [adminCount, setAdminCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [setupSuccess, setSetupSuccess] = useState(false);

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        setLoading(true);
        // First check database connection
        const dbResponse = await fetch('/api/test-db');
        const dbData = await dbResponse.json();
        
        if (dbResponse.status !== 200) {
          throw new Error('MongoDB connection failed: ' + dbData.error);
        }
        
        // Now check admin count
        const response = await fetch('/api/admin/check-status');
        const data = await response.json();
        
        if (response.status === 200) {
          setAdminCount(data.adminCount);
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    
    if (isLoaded && user) {
      checkAdminStatus();
    }
  }, [isLoaded, user]);

  async function handleSetupAdmin() {
    try {
      setStatus("Processing request...");
      
      const response = await fetch('/api/admin/setup-first-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus("Admin role granted! Redirecting to admin panel...");
        setSetupSuccess(true);
        setTimeout(() => {
          window.location.href = '/admin';
        }, 1500);
      } else {
        setStatus(`Error: ${data.error || 'Failed to set up admin user'}${data.details ? ': ' + data.details : ''}`);
      }
    } catch (error) {
      console.error("Admin setup error:", error);
      setStatus("An unexpected error occurred. Please try again.");
    }
  }

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
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
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full">
        <div className="flex justify-end mb-4">
          <UserButton afterSignOutUrl="/" />
        </div>
        
        <div className="bg-white p-8 shadow-md rounded-lg">
          <h1 className="text-2xl font-bold text-center mb-6">Admin Setup</h1>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-pulse mb-2">Checking admin status...</div>
              <div className="h-1 w-full bg-gray-200 rounded overflow-hidden">
                <div className="h-full bg-blue-500 animate-pulse" style={{ width: '50%' }}></div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded mb-6">
              <p className="font-medium">Error checking admin status</p>
              <p className="text-sm mt-2">{error}</p>
              <p className="text-sm mt-2">
                Please make sure MongoDB is properly connected.
              </p>
              <div className="mt-4 text-center">
                <button 
                  onClick={() => window.location.reload()}
                  className="text-blue-500 hover:text-blue-700 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : adminCount && adminCount > 0 ? (
            <div className="text-center">
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded mb-6">
                <p className="font-medium">Admin users already exist.</p>
                <p className="text-sm mt-2">
                  An admin user has already been set up. Please request admin access from an existing administrator.
                </p>
              </div>
              
              <Link href="/dashboard" className="text-blue-500 hover:text-blue-700 underline">
                Return to Dashboard
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-6 text-gray-600">
                You're about to become the first administrator for this application. 
                As an admin, you'll be able to manage users and their roles.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded mb-6">
                <p className="font-medium">No admin users found</p>
                <p className="text-sm mt-2">
                  You will be set up as the first administrator.
                </p>
              </div>
              
              <div className="text-center">
                <button
                  onClick={handleSetupAdmin}
                  disabled={loading || setupSuccess}
                  className={`bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded ${
                    (loading || setupSuccess) ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {setupSuccess ? 'Setup Complete!' : 'Set Me as Administrator'}
                </button>
                
                {status && (
                  <div className={`mt-4 text-sm ${
                    setupSuccess ? 'text-green-600' : status.startsWith('Error') ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {status}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 