"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Feedback {
  _id: string;
  title: string;
  description: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  imageUrl: string;
  userId: string;
  userEmail: string;
  status: "pending" | "under_review" | "resolved" | "rejected";
  severity: "low" | "medium" | "high" | "critical";
  createdAt: string;
  updatedAt: string;
  adminComment?: string;
}

export default function AdminFeedbackPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [feedbackReports, setFeedbackReports] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState<Feedback | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [adminComment, setAdminComment] = useState("");

  // Check if user is signed in and admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (isLoaded && isSignedIn) {
        try {
          const response = await fetch('/api/admin/check-admin');
          const data = await response.json();
          setIsAdmin(data.isAdmin);
          
          if (!data.isAdmin) {
            router.push('/dashboard');
          }
        } catch (err) {
          console.error('Failed to check admin status:', err);
          router.push('/dashboard');
        }
      } else if (isLoaded && !isSignedIn) {
        router.push('/sign-in');
      }
    };

    checkAdmin();
  }, [isLoaded, isSignedIn, router]);

  // Fetch feedback reports
  useEffect(() => {
    const fetchFeedback = async () => {
      if (!isAdmin) return;
      
      setLoading(true);
      try {
        const url = new URL('/api/feedback', window.location.origin);
        url.searchParams.append('page', currentPage.toString());
        url.searchParams.append('limit', '10');
        if (statusFilter !== 'all') {
          url.searchParams.append('status', statusFilter);
        }
        
        const response = await fetch(url.toString());
        const data = await response.json();
        
        if (response.ok) {
          setFeedbackReports(data.data);
          setTotalPages(data.pagination.pages);
        } else {
          throw new Error(data.error || 'Failed to fetch feedback reports');
        }
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError('Failed to load feedback reports. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [isAdmin, currentPage, statusFilter]);

  // Handle status update
  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedReport) return;
    
    setStatusUpdateLoading(true);
    try {
      const response = await fetch('/api/admin/update-feedback-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbackId: selectedReport._id,
          status: newStatus,
          adminComment,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update the local state with the updated report
        setFeedbackReports(prev => 
          prev.map(report => 
            report._id === selectedReport._id ? data.feedback : report
          )
        );
        setSelectedReport(null);
        setAdminComment("");
      } else {
        throw new Error(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // View report details
  const handleViewReport = (report: Feedback) => {
    setSelectedReport(report);
    setAdminComment(report.adminComment || "");
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Get severity class for badge coloring
  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status class for badge coloring
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !feedbackReports.length) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Feedback Reports</h1>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Status
        </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1); // Reset to page 1 when filter changes
          }}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="all">All Reports</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      
      {/* Reports Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Severity
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {feedbackReports.length > 0 ? (
              feedbackReports.map((report) => (
                <tr key={report._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{report.title}</div>
                    <div className="text-sm text-gray-500">{report.userEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{report.location.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityClass(report.severity)}`}>
                      {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(report.status)}`}>
                      {report.status.replace('_', ' ').charAt(0).toUpperCase() + report.status.replace('_', ' ').slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(report.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewReport(report)}
                      className="text-green-600 hover:text-green-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No feedback reports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="px-4 py-2 border-t border-b border-gray-300 bg-white text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
      
      {/* Modal for report details */}
      {selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-10">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedReport.title}</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Details</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedReport.description}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Location</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedReport.location.address}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Coordinates</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedReport.location.coordinates.lat.toFixed(6)}, {selectedReport.location.coordinates.lng.toFixed(6)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Severity</dt>
                      <dd className="mt-1">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityClass(selectedReport.severity)}`}>
                          {selectedReport.severity.charAt(0).toUpperCase() + selectedReport.severity.slice(1)}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Reported By</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedReport.userEmail}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Date Reported</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedReport.createdAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Current Status</dt>
                      <dd className="mt-1">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(selectedReport.status)}`}>
                          {selectedReport.status.replace('_', ' ').charAt(0).toUpperCase() + selectedReport.status.replace('_', ' ').slice(1)}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Image</h3>
                  <div className="relative h-64 w-full">
                    <Image
                      src={selectedReport.imageUrl}
                      alt={selectedReport.title}
                      fill
                      className="object-contain rounded-md"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="adminComment" className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Comment
                </label>
                <textarea
                  id="adminComment"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Add any notes or comments about this report"
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-4 justify-end">
                <button
                  onClick={() => handleStatusUpdate('under_review')}
                  disabled={statusUpdateLoading || selectedReport.status === 'under_review'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark Under Review
                </button>
                <button
                  onClick={() => handleStatusUpdate('resolved')}
                  disabled={statusUpdateLoading || selectedReport.status === 'resolved'}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark as Resolved
                </button>
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={statusUpdateLoading || selectedReport.status === 'rejected'}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject Report
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 