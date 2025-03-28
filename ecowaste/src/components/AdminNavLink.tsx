"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export function AdminNavLink() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isSignedIn) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // First try the debug endpoint
        const debugResponse = await fetch("/api/debug");
        const debugData = await debugResponse.json();
        setDebugInfo(debugData);
        
        // Then check admin status
        const response = await fetch("/api/admin/check-admin");
        const data = await response.json();
        
        console.log("Admin check response:", data);
        
        if (response.ok && data.isAdmin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      checkAdminStatus();
    }
  }, [isLoaded, isSignedIn]);

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Only show admin link if user is an admin
  if (!isLoaded || loading || !isAdmin) {
    return null;
  }

  return (
    <div className="relative mx-2" ref={dropdownRef}>
      <button
        className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Admin
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5">
          <div className="py-1 divide-y divide-gray-100">
            <Link 
              href="/admin/dashboard" 
              className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700"
              onClick={() => setShowDropdown(false)}
            >
              <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
            <Link 
              href="/admin/projects" 
              className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700"
              onClick={() => setShowDropdown(false)}
            >
              <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Project Proposals
            </Link>
            <Link 
              href="/admin/users" 
              className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700"
              onClick={() => setShowDropdown(false)}
            >
              <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Manage Users
            </Link>
            <Link 
              href="/admin/reports" 
              className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700"
              onClick={() => setShowDropdown(false)}
            >
              <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Manage Reports
            </Link>
            <Link 
              href="/admin/analytics" 
              className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700"
              onClick={() => setShowDropdown(false)}
            >
              <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12a3 3 0 110-6 3 3 0 010 6z" />
              </svg>
              Analytics & Logs
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 