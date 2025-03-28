"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminProtected from "@/components/AdminProtected";
import LoadingSpinner from "@/components/LoadingSpinner";

type ProjectStatus = "pending" | "approved" | "rejected";
type ProjectVisibility = "public" | "private" | "moderated";
type ProjectCategory = "segregation" | "disposal" | "sanitization" | "other";

interface Project {
  _id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  location: string;
  budget: number;
  timeline: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  visibility: ProjectVisibility;
  userId: string;
  userEmail: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  adminComment?: string;
}

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [adminComment, setAdminComment] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/projects${statusFilter !== "all" ? `?status=${statusFilter}` : ""}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      
      const data = await response.json();
      setProjects(data.projects);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateProjectStatus = async (id: string, status: ProjectStatus) => {
    try {
      setUpdatingStatus(true);
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          adminComment: adminComment.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update project status");
      }

      // Refresh projects list
      fetchProjects();
      setSelectedProject(null);
      setAdminComment("");
    } catch (err) {
      console.error("Error updating project status:", err);
      setError("Failed to update project status. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const renderStatusBadge = (status: ProjectStatus) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <AdminProtected>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Project Proposals</h1>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <label htmlFor="status-filter" className="mr-2 font-medium">
            Filter by status:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | "all")}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Projects</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        {loading ? (
          <LoadingSpinner />
        ) : projects.length === 0 ? (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No projects found</h3>
            <p className="mt-1 text-gray-500">
              {statusFilter !== "all"
                ? `There are no ${statusFilter} project proposals.`
                : "There are no project proposals yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Title
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Category
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Budget
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Submitted
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {projects.map((project) => (
                  <tr key={project._id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {project.title}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {project.category.charAt(0).toUpperCase() + project.category.slice(1)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      ${project.budget.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {renderStatusBadge(project.status)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="text-green-600 hover:text-green-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">{selectedProject.title}</h2>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Project Details</h3>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="mt-1">{renderStatusBadge(selectedProject.status)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Category</dt>
                        <dd className="mt-1">
                          {selectedProject.category.charAt(0).toUpperCase() + selectedProject.category.slice(1)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Location</dt>
                        <dd className="mt-1">{selectedProject.location}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Budget</dt>
                        <dd className="mt-1">${selectedProject.budget.toLocaleString()}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Timeline</dt>
                        <dd className="mt-1">{selectedProject.timeline}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Visibility</dt>
                        <dd className="mt-1">
                          {selectedProject.visibility.charAt(0).toUpperCase() + selectedProject.visibility.slice(1)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Submitted</dt>
                        <dd className="mt-1">{new Date(selectedProject.createdAt).toLocaleString()}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Contact Name</dt>
                        <dd className="mt-1">{selectedProject.contactName}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Contact Email</dt>
                        <dd className="mt-1">{selectedProject.contactEmail}</dd>
                      </div>
                      {selectedProject.contactPhone && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Contact Phone</dt>
                          <dd className="mt-1">{selectedProject.contactPhone}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-sm font-medium text-gray-500">User Email</dt>
                        <dd className="mt-1">{selectedProject.userEmail}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">User ID</dt>
                        <dd className="mt-1 text-sm text-gray-500 font-mono">{selectedProject.userId}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Project Description</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedProject.description}</p>
                  </div>
                </div>
                
                {selectedProject.adminComment && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Admin Comment</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="whitespace-pre-wrap">{selectedProject.adminComment}</p>
                    </div>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Add Comment (Optional)</h3>
                  <textarea
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Add a comment for the user"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  {selectedProject.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateProjectStatus(selectedProject._id, "rejected")}
                        disabled={updatingStatus}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        {updatingStatus ? "Updating..." : "Reject Project"}
                      </button>
                      <button
                        onClick={() => updateProjectStatus(selectedProject._id, "approved")}
                        disabled={updatingStatus}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        {updatingStatus ? "Updating..." : "Approve Project"}
                      </button>
                    </>
                  )}
                  {selectedProject.status !== "pending" && (
                    <button
                      onClick={() => updateProjectStatus(selectedProject._id, "pending")}
                      disabled={updatingStatus}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {updatingStatus ? "Updating..." : "Mark as Pending"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminProtected>
  );
} 