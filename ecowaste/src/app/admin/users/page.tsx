"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminProtected from "@/components/AdminProtected";
import LoadingSpinner from "@/components/LoadingSpinner";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  lastSignIn?: string;
  role: 'admin' | 'user';
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error fetching users response:", errorText);
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminProtected>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {loading ? (
          <LoadingSpinner />
        ) : users.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-gray-500">There are no users in the system.</p>
          </div>
        ) : (
          <div className="overflow-hidden bg-white shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Sign In
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.imageUrl ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.imageUrl}
                              alt={`${user.firstName || ''} ${user.lastName || ''}`}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 font-medium">
                                {user.firstName?.[0] || user.email[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}`
                              : 'User'}
                          </div>
                          <div className="text-sm text-gray-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastSignIn ? new Date(user.lastSignIn).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-green-600 hover:text-green-900 mr-4"
                        onClick={() => {/* View user details functionality */}}
                      >
                        View
                      </button>
                      {user.role !== 'admin' && (
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => {/* Make admin functionality */}}
                        >
                          Make Admin
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminProtected>
  );
} 