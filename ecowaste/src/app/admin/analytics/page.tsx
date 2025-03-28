"use client";

import { useState, useEffect } from "react";
import AdminProtected from "@/components/AdminProtected";
import LoadingSpinner from "@/components/LoadingSpinner";

type LogAction = 
  | 'page_view' 
  | 'button_click' 
  | 'form_submit'
  | 'project_create'
  | 'project_update'
  | 'report_submit'
  | 'admin_action'
  | 'error';

interface LogEntry {
  _id: string;
  userId?: string;
  action: LogAction;
  path: string;
  elementId?: string;
  elementText?: string;
  details?: Record<string, any>;
  userAgent?: string;
  ip?: string;
  timestamp: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function AdminAnalyticsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 50,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [pathFilter, setPathFilter] = useState<string>("");
  const [userIdFilter, setUserIdFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "50"); // Fixed limit
      
      if (actionFilter) params.append("action", actionFilter);
      if (pathFilter) params.append("path", pathFilter);
      if (userIdFilter) params.append("userId", userIdFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      
      const response = await fetch(`/api/admin/logs?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.status}`);
      }
      
      const data = await response.json();
      setLogs(data.logs || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 50, pages: 0 });
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError(err instanceof Error ? err.message : "Failed to load logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, pathFilter, userIdFilter, startDate, endDate]);
  
  const handleFilterChange = (filterName: string, value: string) => {
    // Reset page when changing filters
    setPage(1);
    
    switch (filterName) {
      case "action":
        setActionFilter(value);
        break;
      case "path":
        setPathFilter(value);
        break;
      case "userId":
        setUserIdFilter(value);
        break;
      case "startDate":
        setStartDate(value);
        break;
      case "endDate":
        setEndDate(value);
        break;
      default:
        break;
    }
  };
  
  const clearFilters = () => {
    setPage(1);
    setActionFilter("");
    setPathFilter("");
    setUserIdFilter("");
    setStartDate("");
    setEndDate("");
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };
  
  const getActionColor = (action: LogAction) => {
    switch (action) {
      case "page_view":
        return "bg-blue-100 text-blue-800";
      case "button_click":
        return "bg-green-100 text-green-800";
      case "form_submit":
        return "bg-purple-100 text-purple-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "admin_action":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderLogDetails = (log: LogEntry) => {
    return (
      <div className="mt-2 text-xs text-gray-600">
        {log.elementId && <div><span className="font-medium">Element ID:</span> {log.elementId}</div>}
        {log.elementText && <div><span className="font-medium">Element Text:</span> {log.elementText}</div>}
        {log.ip && <div><span className="font-medium">IP:</span> {log.ip}</div>}
        {log.details && Object.keys(log.details).length > 0 && (
          <div>
            <span className="font-medium">Details:</span>
            <pre className="mt-1 bg-gray-50 p-2 rounded overflow-auto max-h-20">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  // Define action options
  const actionOptions = [
    { value: "", label: "All Actions" },
    { value: "page_view", label: "Page Views" },
    { value: "button_click", label: "Button Clicks" },
    { value: "form_submit", label: "Form Submissions" },
    { value: "project_create", label: "Project Created" },
    { value: "project_update", label: "Project Updated" },
    { value: "report_submit", label: "Report Submitted" },
    { value: "admin_action", label: "Admin Actions" },
    { value: "error", label: "Errors" },
  ];

  return (
    <AdminProtected>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">User Activity Analytics</h1>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-medium mb-4">Filter Logs</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Action filter */}
            <div>
              <label htmlFor="action-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Action Type
              </label>
              <select
                id="action-filter"
                value={actionFilter}
                onChange={(e) => handleFilterChange("action", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {actionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Path filter */}
            <div>
              <label htmlFor="path-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Path
              </label>
              <input
                type="text"
                id="path-filter"
                value={pathFilter}
                onChange={(e) => handleFilterChange("path", e.target.value)}
                placeholder="e.g., /dashboard"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            {/* User ID filter */}
            <div>
              <label htmlFor="userId-filter" className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <input
                type="text"
                id="userId-filter"
                value={userIdFilter}
                onChange={(e) => handleFilterChange("userId", e.target.value)}
                placeholder="Clerk User ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            {/* Date range */}
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="datetime-local"
                id="start-date"
                value={startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="datetime-local"
                id="end-date"
                value={endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          {/* Filter actions */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 mr-2"
            >
              Clear Filters
            </button>
            <button
              onClick={fetchLogs}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
        
        {/* Results */}
        {loading ? (
          <LoadingSpinner />
        ) : logs.length === 0 ? (
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
            <h3 className="mt-2 text-lg font-medium text-gray-900">No logs found</h3>
            <p className="mt-1 text-gray-500">
              Try adjusting your filters or check back later.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Activity Logs ({pagination.total} total)
                </h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <li key={log._id} className="px-4 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                        <span className="ml-3 text-sm font-medium text-gray-900">{log.path}</span>
                      </div>
                      <div className="text-sm text-gray-500">{formatDate(log.timestamp)}</div>
                    </div>
                    <div className="mt-1">
                      <span className="text-sm text-gray-500">
                        {log.userId ? (
                          <>User ID: <span className="font-mono">{log.userId}</span></>
                        ) : (
                          "Anonymous user"
                        )}
                      </span>
                    </div>
                    {renderLogDetails(log)}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="flex-1 flex justify-between sm:justify-end">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className={`px-4 py-2 border border-gray-300 rounded-md ${
                      page === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>
                  <div className="mx-4 flex items-center">
                    <span className="text-gray-700">
                      Page {page} of {pagination.pages}
                    </span>
                  </div>
                  <button
                    onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                    disabled={page === pagination.pages}
                    className={`ml-3 px-4 py-2 border border-gray-300 rounded-md ${
                      page === pagination.pages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminProtected>
  );
} 