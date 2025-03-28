"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  status: ProjectStatus;
  visibility: ProjectVisibility;
  createdAt: string;
  updatedAt: string;
  adminComment?: string;
}

export default function MyProjectsPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in?redirect_url=/waste-management/my-projects");
      return;
    }

    if (isLoaded && isSignedIn) {
      fetchUserProjects();
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchUserProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/projects");
      
      if (response.ok) {
        const data = await response.json();
        
        // Check if there's a warning from the API (using mock data)
        if (data.warning) {
          console.warn("API Warning:", data.warning);
          setError("Note: Showing demo data. Some features may be limited.");
        }
        
        setProjects(data.projects || []);
      } else {
        // Log the error but don't throw - use mock data instead
        console.error("Failed to fetch projects:", await response.text());
        
        // Create mock projects for better user experience
        const mockProjects: Project[] = [
          {
            _id: "mock_project_1",
            title: "Community Waste Segregation",
            description: "A project to implement waste segregation in residential communities",
            category: "segregation" as ProjectCategory,
            location: "Downtown Area",
            budget: 5000,
            timeline: "3 months",
            status: "pending" as ProjectStatus,
            visibility: "public" as ProjectVisibility,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: "mock_project_2",
            title: "School Recycling Program",
            description: "Implementing recycling stations in local schools",
            category: "disposal" as ProjectCategory,
            location: "School District",
            budget: 3200,
            timeline: "2 months",
            status: "approved" as ProjectStatus,
            visibility: "public" as ProjectVisibility,
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        
        setProjects(mockProjects);
        setError("Note: Unable to load your actual projects. Showing example data.");
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      
      // Provide mock data even when fetch throws an error
      const mockProjects: Project[] = [
        {
          _id: "mock_error_1",
          title: "Demo Project",
          description: "This is an example project shown when the server is unavailable",
          category: "other" as ProjectCategory,
          location: "Example Location",
          budget: 1000,
          timeline: "1 month",
          status: "pending" as ProjectStatus,
          visibility: "public" as ProjectVisibility,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      setProjects(mockProjects);
      setError("Could not connect to the server. Showing example data for demonstration.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case "approved":
        return "text-green-700 bg-green-100";
      case "rejected":
        return "text-red-700 bg-red-100";
      default:
        return "text-yellow-700 bg-yellow-100";
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Project Proposals</h1>
        <Link
          href="/waste-management/propose"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          + New Project Proposal
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

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
            You haven't submitted any project proposals yet.
          </p>
          <div className="mt-6">
            <Link
              href="/waste-management/propose"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Propose a New Project
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg divide-y divide-gray-200">
          {projects.map((project) => (
            <div key={project._id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">{project.title}</h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    project.status
                  )}`}
                >
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">
                    {project.category.charAt(0).toUpperCase() + project.category.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="font-medium">${project.budget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submitted On</p>
                  <p className="font-medium">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-600 line-clamp-2">{project.description}</p>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setSelectedProject(project)}
                  className="text-green-600 hover:text-green-800 font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{selectedProject.title}</h2>
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
              
              <div className="mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    selectedProject.status
                  )}`}
                >
                  {selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1)}
                </span>
              </div>
              
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Project Details</h3>
                  <dl className="space-y-2">
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
                        {selectedProject.visibility ? 
                          selectedProject.visibility.charAt(0).toUpperCase() + selectedProject.visibility.slice(1) : 
                          "Unknown"}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Status Information</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Submitted</dt>
                      <dd className="mt-1">{new Date(selectedProject.createdAt).toLocaleString()}</dd>
                    </div>
                    {selectedProject.updatedAt !== selectedProject.createdAt && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                        <dd className="mt-1">{new Date(selectedProject.updatedAt).toLocaleString()}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Current Status</dt>
                      <dd className="mt-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            selectedProject.status
                          )}`}
                        >
                          {selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1)}
                        </span>
                      </dd>
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
                  <h3 className="text-lg font-medium mb-2">Admin Feedback</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="whitespace-pre-wrap text-blue-800">{selectedProject.adminComment}</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                {selectedProject.status === "rejected" && (
                  <Link
                    href="/waste-management/propose"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Submit New Proposal
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 