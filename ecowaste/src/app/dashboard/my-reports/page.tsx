"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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
  status: "pending" | "under_review" | "resolved" | "rejected";
  severity: "low" | "medium" | "high" | "critical";
  createdAt: string;
  updatedAt: string;
  adminComment?: string;
}

export default function MyReportsPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [reports, setReports] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState<Feedback | null>(null);

  // Check if user is signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Fetch user's reports
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchReports = async () => {
      try {
        const response = await fetch(`/api/feedback?userId=${user?.id}`);
        const data = await response.json();

        if (response.ok) {
          setReports(data.data);
        } else {
          throw new Error(data.error || "Failed to fetch reports");
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Failed to load your reports. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [isLoaded, isSignedIn, user?.id]);

  // View report details
  const handleViewReport = (report: Feedback) => {
    setSelectedReport(report);
  };

  // Close report modal
  const handleCloseModal = () => {
    setSelectedReport(null);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Get severity class for badge coloring
  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status class for badge coloring
  const getStatusClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "under_review":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get friendly status name
  const getStatusName = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (!isLoaded || !isSignedIn) {
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Reports</h1>
        <Link
          href="/feedback/report"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Report New Issue
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <svg
            className="h-16 w-16 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h2 className="text-xl font-semibold mb-2">No reports yet</h2>
          <p className="text-gray-600 mb-6">
            You haven't submitted any reports yet. Report unhygienic areas to help keep your
            community clean.
          </p>
          <Link
            href="/feedback/report"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md inline-block"
          >
            Submit Your First Report
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <div
              key={report._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48">
                <Image
                  src={report.imageUrl}
                  alt={report.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                      report.status
                    )}`}
                  >
                    {getStatusName(report.status)}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 truncate">{report.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{report.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleViewReport(report)}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">{selectedReport.title}</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">Status</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                          selectedReport.status
                        )}`}
                      >
                        {getStatusName(selectedReport.status)}
                      </span>
                    </div>
                    {selectedReport.status === "resolved" && (
                      <div className="bg-green-50 p-3 rounded-md">
                        <p className="text-sm text-green-800">
                          This issue has been resolved. Thank you for your report!
                        </p>
                      </div>
                    )}
                    {selectedReport.status === "rejected" && (
                      <div className="bg-red-50 p-3 rounded-md">
                        <p className="text-sm text-red-800">
                          This report has been reviewed and cannot be addressed at this time.
                        </p>
                      </div>
                    )}
                    {selectedReport.status === "under_review" && (
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-sm text-blue-800">
                          Your report is currently being reviewed by our team.
                        </p>
                      </div>
                    )}
                    {selectedReport.status === "pending" && (
                      <div className="bg-yellow-50 p-3 rounded-md">
                        <p className="text-sm text-yellow-800">
                          Your report is waiting to be reviewed.
                        </p>
                      </div>
                    )}
                  </div>

                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="mt-1 text-gray-900">{selectedReport.description}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Location</dt>
                      <dd className="mt-1 text-gray-900">{selectedReport.location.address}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Reported On</dt>
                      <dd className="mt-1 text-gray-900">
                        {formatDate(selectedReport.createdAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                      <dd className="mt-1 text-gray-900">
                        {formatDate(selectedReport.updatedAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Severity</dt>
                      <dd className="mt-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityClass(
                            selectedReport.severity
                          )}`}
                        >
                          {selectedReport.severity.charAt(0).toUpperCase() +
                            selectedReport.severity.slice(1)}
                        </span>
                      </dd>
                    </div>
                  </dl>

                  {selectedReport.adminComment && (
                    <div className="mt-6 bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium text-gray-900 mb-2">Admin Comment</h4>
                      <p className="text-gray-700">{selectedReport.adminComment}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Image</h3>
                  <div className="relative h-80 w-full rounded-md overflow-hidden">
                    <Image
                      src={selectedReport.imageUrl}
                      alt={selectedReport.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 