"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminProtected from "@/components/AdminProtected";
import LoadingSpinner from "@/components/LoadingSpinner";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "user" | "admin";
}

interface Project {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  visibility: "public" | "private" | "moderated";
  createdAt: string;
}

interface StatsData {
  totalUsers: number;
  totalProjects: number;
  pendingProjects: number;
  approvedProjects: number;
  rejectedProjects: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalProjects: 0,
    pendingProjects: 0,
    approvedProjects: 0,
    rejectedProjects: 0,
  });
  
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingProject, setUpdatingProject] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

    const fetchData = async () => {
      setLoading(true);
    try {
      // Fetch users or use mock data
      let recentUsersList = [];
      try {
        const usersResponse = await fetch("/api/admin/users");
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          recentUsersList = usersData.users || [];
          setRecentUsers(recentUsersList.slice(0, 5)); // Just take the first 5 for recent users
        } else {
          // Don't show error, just use mock data
          console.error("Failed to fetch users:", await usersResponse.text());
          
          // Mock user data
          recentUsersList = [
            { id: "mock_1", email: "admin@example.com", firstName: "Admin", lastName: "User", role: "admin" as "admin" },
            { id: "mock_2", email: "user1@example.com", firstName: "John", lastName: "Doe", role: "user" as "user" },
            { id: "mock_3", email: "user2@example.com", firstName: "Jane", lastName: "Smith", role: "user" as "user" },
            { id: "mock_4", email: "user3@example.com", firstName: "Bob", lastName: "Johnson", role: "user" as "user" },
            { id: "mock_5", email: "user4@example.com", firstName: "Mary", lastName: "Williams", role: "user" as "user" },
          ];
          setRecentUsers(recentUsersList.slice(0, 5));
        }
      } catch (err) {
        console.error("Users API error:", err);
        // Mock user data when API throws error
        recentUsersList = [
          { id: "mock_1", email: "admin@example.com", firstName: "Admin", lastName: "User", role: "admin" as "admin" },
          { id: "mock_2", email: "user1@example.com", firstName: "John", lastName: "Doe", role: "user" as "user" },
          { id: "mock_3", email: "user2@example.com", firstName: "Jane", lastName: "Smith", role: "user" as "user" },
          { id: "mock_4", email: "user3@example.com", firstName: "Bob", lastName: "Johnson", role: "user" as "user" },
          { id: "mock_5", email: "user4@example.com", firstName: "Mary", lastName: "Williams", role: "user" as "user" },
        ];
        setRecentUsers(recentUsersList.slice(0, 5));
      }
      
      // Fetch projects or use mock data
      let projectsList = [];
      try {
        const projectsResponse = await fetch("/api/admin/projects");
        
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          projectsList = projectsData.projects || [];
          setRecentProjects(projectsList.slice(0, 5)); // Just take the first 5 for recent projects
        } else {
          // Don't show error, just use mock data
          console.error("Failed to fetch projects:", await projectsResponse.text());
          
          // Mock project data
          projectsList = [
            { _id: "mock_p1", title: "Waste Segregation", description: "Community waste segregation project", category: "segregation", status: "pending", visibility: "public" as "public", createdAt: new Date().toISOString() },
            { _id: "mock_p2", title: "Recycle Initiative", description: "School recycling program", category: "disposal", status: "approved", visibility: "public" as "public", createdAt: new Date().toISOString() },
            { _id: "mock_p3", title: "Clean Park Program", description: "Park cleaning and maintenance", category: "sanitization", status: "rejected", visibility: "private" as "private", createdAt: new Date().toISOString() },
            { _id: "mock_p4", title: "Waste Audit", description: "Conducting waste audits for businesses", category: "other", status: "approved", visibility: "public" as "public", createdAt: new Date().toISOString() },
            { _id: "mock_p5", title: "Green Campus", description: "Making schools more environmentally friendly", category: "segregation", status: "pending", visibility: "moderated" as "moderated", createdAt: new Date().toISOString() },
          ];
          setRecentProjects(projectsList.slice(0, 5));
        }
      } catch (err) {
        console.error("Projects API error:", err);
        // Mock project data when API throws error
        projectsList = [
          { _id: "mock_p1", title: "Waste Segregation", description: "Community waste segregation project", category: "segregation", status: "pending", visibility: "public" as "public", createdAt: new Date().toISOString() },
          { _id: "mock_p2", title: "Recycle Initiative", description: "School recycling program", category: "disposal", status: "approved", visibility: "public" as "public", createdAt: new Date().toISOString() },
          { _id: "mock_p3", title: "Clean Park Program", description: "Park cleaning and maintenance", category: "sanitization", status: "rejected", visibility: "private" as "private", createdAt: new Date().toISOString() },
          { _id: "mock_p4", title: "Waste Audit", description: "Conducting waste audits for businesses", category: "other", status: "approved", visibility: "public" as "public", createdAt: new Date().toISOString() },
          { _id: "mock_p5", title: "Green Campus", description: "Making schools more environmentally friendly", category: "segregation", status: "pending", visibility: "moderated" as "moderated", createdAt: new Date().toISOString() },
        ];
        setRecentProjects(projectsList.slice(0, 5));
      }
      
      // Calculate stats with whatever data we have
      setStats({
        totalUsers: recentUsersList.length,
        totalProjects: projectsList.length,
        pendingProjects: projectsList.filter((p: Project) => p.status === 'pending').length,
        approvedProjects: projectsList.filter((p: Project) => p.status === 'approved').length,
        rejectedProjects: projectsList.filter((p: Project) => p.status === 'rejected').length,
      });
      
      // Set info message if using mock data
      if (recentUsersList[0]?.id?.startsWith('mock_') || projectsList[0]?._id?.startsWith('mock_')) {
        setError("Note: Some data is currently mocked for demonstration purposes. Connect the APIs for real data.");
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      
      // Use mock data for everything if all else fails
      const mockUsers = [
        { id: "mock_1", email: "admin@example.com", firstName: "Admin", lastName: "User", role: "admin" as "admin" },
        { id: "mock_2", email: "user1@example.com", firstName: "John", lastName: "Doe", role: "user" as "user" },
        { id: "mock_3", email: "user2@example.com", firstName: "Jane", lastName: "Smith", role: "user" as "user" },
      ];
      
      const mockProjects = [
        { _id: "mock_p1", title: "Waste Segregation", description: "Community project", category: "segregation", status: "pending", visibility: "public" as "public", createdAt: new Date().toISOString() },
        { _id: "mock_p2", title: "Recycle Initiative", description: "School program", category: "disposal", status: "approved", visibility: "public" as "public", createdAt: new Date().toISOString() },
        { _id: "mock_p3", title: "Clean Park Program", description: "Park maintenance", category: "sanitization", status: "rejected", visibility: "private" as "private", createdAt: new Date().toISOString() },
      ];
      
      setRecentUsers(mockUsers);
      setRecentProjects(mockProjects);
      
      setStats({
        totalUsers: mockUsers.length,
        totalProjects: mockProjects.length,
        pendingProjects: 1,
        approvedProjects: 1,
        rejectedProjects: 1,
      });
      
      setError("Note: Using mock data due to API errors. This is a demonstration only.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProjectStatus = async (projectId: string, newStatus: string) => {
    setUpdatingProject(projectId);
    try {
      const response = await fetch("/api/admin/update-project-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          projectId,
          status: newStatus
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update project status");
      }

      // Refresh data after successful update
      fetchData();
    } catch (err) {
      console.error("Error updating project status:", err);
      setError(err instanceof Error ? err.message : "Failed to update project");
    } finally {
      setUpdatingProject(null);
    }
  };

  if (loading) {
    return (
      <AdminProtected>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </AdminProtected>
    );
  }

  return (
    <AdminProtected>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-sm font-medium text-red-700 hover:text-red-900"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Total Users</div>
            <div className="mt-2 text-3xl font-semibold">{stats.totalUsers}</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Total Projects</div>
            <div className="mt-2 text-3xl font-semibold">{stats.totalProjects}</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Pending Projects</div>
            <div className="mt-2 text-3xl font-semibold text-yellow-600">{stats.pendingProjects}</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Approved Projects</div>
            <div className="mt-2 text-3xl font-semibold text-green-600">{stats.approvedProjects}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Rejected Projects</div>
            <div className="mt-2 text-3xl font-semibold text-red-600">{stats.rejectedProjects}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium">Recent Users</h2>
              <Link href="/admin/users" className="text-sm text-blue-600 hover:text-blue-800">
                View All
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {recentUsers.length === 0 ? (
                <p className="p-6 text-gray-500 text-center">No users found</p>
              ) : (
                recentUsers.map((user) => (
                  <div key={user.id} className="px-6 py-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : "User"}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                            user.role === "admin" 
                              ? "bg-purple-100 text-purple-800" 
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role === "admin" ? "Admin" : "User"}
                    </span>
              </div>
                ))
              )}
            </div>
                          </div>

          {/* Recent Projects */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium">Recent Projects</h2>
              <Link href="/admin/projects" className="text-sm text-blue-600 hover:text-blue-800">
                View All
              </Link>
                          </div>
            <div className="divide-y divide-gray-200">
              {recentProjects.length === 0 ? (
                <p className="p-6 text-gray-500 text-center">No projects found</p>
              ) : (
                recentProjects.map((project) => (
                  <div key={project._id} className="px-6 py-4">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium">{project.title}</p>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          project.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : project.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </span>
              </div>
                    <p className="text-sm text-gray-500 mb-1 truncate">{project.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xs text-gray-500">
                        <span className="capitalize">{project.category}</span> • {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                      {project.status === "pending" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateProjectStatus(project._id, "approved")}
                            disabled={updatingProject === project._id}
                            className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded hover:bg-green-100 transition"
                          >
                            {updatingProject === project._id ? "Updating..." : "Approve"}
                          </button>
                          <button
                            onClick={() => handleUpdateProjectStatus(project._id, "rejected")}
                            disabled={updatingProject === project._id}
                            className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded hover:bg-red-100 transition"
                          >
                            {updatingProject === project._id ? "Updating..." : "Reject"}
                          </button>
                        </div>
                      )}
                    </div>
                    </div>
                  ))
                )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link
              href="/admin/projects"
              className="p-4 bg-blue-50 rounded-lg text-blue-700 hover:bg-blue-100 transition"
            >
              <h3 className="font-medium">Manage Projects</h3>
              <p className="text-sm mt-1">Review and moderate project proposals</p>
            </Link>
            
            <Link
              href="/admin/users"
              className="p-4 bg-purple-50 rounded-lg text-purple-700 hover:bg-purple-100 transition"
            >
              <h3 className="font-medium">Manage Users</h3>
              <p className="text-sm mt-1">View and manage user accounts</p>
            </Link>
            
            <Link
              href="/admin/feedback"
              className="p-4 bg-orange-50 rounded-lg text-orange-700 hover:bg-orange-100 transition"
            >
              <h3 className="font-medium">Review Feedback</h3>
              <p className="text-sm mt-1">Address user reported issues</p>
            </Link>
          </div>
        </div>

        {/* Pending Approvals Section */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Pending Approvals</h2>
            <button 
              onClick={fetchData}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-r-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-yellow-800">Pending Projects</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    {stats.pendingProjects} {stats.pendingProjects === 1 ? 'project' : 'projects'} waiting for review
                  </p>
                </div>
                <Link 
                  href="/admin/projects?status=pending"
                  className="px-3 py-1 bg-white text-yellow-700 text-sm rounded border border-yellow-300 hover:bg-yellow-100 transition"
                >
                  Review Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminProtected>
  );
} 