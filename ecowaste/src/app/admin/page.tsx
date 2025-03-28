"use client";

import { useState, useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  clerkId: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const { isLoaded, user, isSignedIn } = useUser();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const response = await fetch('/api/admin/check-admin');
        if (!response.ok) {
          throw new Error('Not authorized as admin');
        }
      } catch (error) {
        console.error('Not an admin user:', error);
        router.push('/dashboard');
      }
    }

    async function loadUsers() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/get-users');
        
        if (!response.ok) {
          throw new Error('Failed to load users');
        }
        
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        console.error("Error loading users:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    
    if (isLoaded && isSignedIn) {
      checkAdminStatus().then(() => loadUsers());
    } else if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  async function handleRoleChange(userId: string, currentRole: string) {
    if (!confirm(`Are you sure you want to change this user's role?`)) {
      return;
    }
    
    try {
      setActionInProgress(userId);
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      
      const response = await fetch('/api/admin/set-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update role');
      }
      
      // Update the local state to reflect the change
      setUsers(users.map(user => 
        user.clerkId === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      console.error("Error updating role:", err);
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionInProgress(null);
    }
  }

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isSignedIn) {
    return <div className="min-h-screen flex items-center justify-center">Please sign in</div>;
  }
  
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-blue-500 hover:text-blue-700 underline">
              User Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          
          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded">
              {error}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.imageUrl && (
                            <div className="flex-shrink-0 h-10 w-10 mr-3">
                              <img className="h-10 w-10 rounded-full" src={user.imageUrl} alt="" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">ID: {user.clerkId.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          className={`text-white px-3 py-1 rounded ${
                            user.role === 'admin' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-purple-500 hover:bg-purple-600'
                          } ${actionInProgress === user.clerkId ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => handleRoleChange(user.clerkId, user.role)}
                          disabled={actionInProgress === user.clerkId}
                        >
                          {actionInProgress === user.clerkId 
                            ? 'Processing...' 
                            : user.role === 'admin' ? 'Make User' : 'Make Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 