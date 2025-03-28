"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

interface User {
  _id: string;
  clerkId: string;
  email: string;
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

interface Comment {
  id: string;
  content: string;
  userName: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  projectId: string;
}

export default function AdminDashboard() {
  const { isSignedIn } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "projects" | "comments">("users");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch users
        const usersResponse = await fetch("/api/admin/get-users");
        const usersData = await usersResponse.json();
        
        if (!usersResponse.ok) {
          throw new Error(usersData.message || "Failed to fetch users");
        }
        
        setUsers(usersData.users);

        // Fetch projects
        const projectsResponse = await fetch("/api/admin/get-projects");
        const projectsData = await projectsResponse.json();
        
        if (!projectsResponse.ok) {
          throw new Error(projectsData.message || "Failed to fetch projects");
        }
        
        setProjects(projectsData.projects);

        // Fetch pending comments
        const commentsResponse = await fetch("/api/admin/get-pending-comments");
        const commentsData = await commentsResponse.json();
        
        if (!commentsResponse.ok) {
          throw new Error(commentsData.message || "Failed to fetch comments");
        }
        
        setComments(commentsData.comments);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn) {
      fetchData();
    }
  }, [isSignedIn]);

  const handleRoleChange = async (userId: string, newRole: "user" | "admin") => {
    setActionInProgress(userId);
    try {
      const response = await fetch("/api/admin/set-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userId, role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user role");
      }

      setUsers(users.map(user => 
        user.clerkId === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      console.error("Error updating role:", err);
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleProjectStatusChange = async (projectId: string, newStatus: Project["status"]) => {
    setActionInProgress(projectId);
    try {
      const response = await fetch("/api/admin/update-project-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId, status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update project status");
      }

      setProjects(projects.map(project => 
        project._id === projectId ? { ...project, status: newStatus } : project
      ));
    } catch (err) {
      console.error("Error updating project status:", err);
      setError(err instanceof Error ? err.message : "Failed to update project status");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCommentModeration = async (commentId: string, status: "approved" | "rejected") => {
    setActionInProgress(commentId);
    try {
      const response = await fetch("/api/admin/moderate-comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentId, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to moderate comment");
      }

      // Remove the moderated comment from the list
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (err) {
      console.error("Error moderating comment:", err);
      setError(err instanceof Error ? err.message : "Failed to moderate comment");
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-blue-500 hover:text-blue-700">
              Home
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab("users")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "users"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab("projects")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "projects"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Projects
              </button>
              <button
                onClick={() => setActiveTab("comments")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "comments"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Comments {comments.length > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                    {comments.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "users" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === "admin" 
                              ? "bg-purple-100 text-purple-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleRoleChange(
                              user.clerkId, 
                              user.role === "admin" ? "user" : "admin"
                            )}
                            disabled={actionInProgress === user.clerkId}
                            className={`px-3 py-1 rounded-md text-sm ${
                              user.role === "admin"
                                ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                : "bg-purple-100 hover:bg-purple-200 text-purple-700"
                            }`}
                          >
                            {actionInProgress === user.clerkId
                              ? "Updating..."
                              : user.role === "admin"
                              ? "Remove Admin"
                              : "Make Admin"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "projects" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Visibility
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {projects.map((project) => (
                      <tr key={project._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {project.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            {project.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            project.status === 'approved' ? 'bg-green-100 text-green-800' :
                            project.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            project.visibility === 'public' ? 'bg-green-100 text-green-800' :
                            project.visibility === 'private' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {project.visibility}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={project.status}
                            onChange={(e) => handleProjectStatusChange(project._id, e.target.value)}
                            disabled={actionInProgress === project._id}
                            className="px-3 py-1 rounded-md text-sm border border-gray-300"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "comments" && (
              <div className="space-y-6">
                {comments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending comments to moderate</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{comment.userName}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCommentModeration(comment.id, "approved")}
                            disabled={actionInProgress === comment.id}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleCommentModeration(comment.id, "rejected")}
                            disabled={actionInProgress === comment.id}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Project ID: {comment.projectId}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* System Logs Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg mt-4">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    System Logs
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      View & Analyze
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link
              href="/admin/logs"
              className="text-sm text-green-700 font-medium hover:text-green-900"
            >
              View all logs →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 