"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import logger from "@/lib/logger";

export function AdminNavLink() {
  const { isLoaded, isSignedIn } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isSignedIn) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        console.log("Checking admin status..."); // Debug log
        const response = await fetch("/api/admin/check-admin");
        const data = await response.json();
        
        console.log("Admin check response:", data); // Debug log
        
        if (response.ok && data.isAdmin) {
          console.log("User is admin"); // Debug log
          setIsAdmin(true);
        } else {
          console.log("User is not admin"); // Debug log
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && isSignedIn) {
      checkAdminStatus();
    } else if (isLoaded) {
      setLoading(false);
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

  // Don't render anything if loading or not signed in
  if (!isLoaded || loading) {
    return null;
  }

  // If not admin, don't render anything
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="relative mr-4" ref={dropdownRef}>
      <button
        className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 focus:outline-none"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span className="mr-1">Admin</span>
        <svg 
          className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
          <Link 
            href="/admin/dashboard" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setShowDropdown(false)}
          >
            Dashboard
          </Link>
          <Link 
            href="/admin/projects" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setShowDropdown(false)}
          >
            Projects
          </Link>
          <Link 
            href="/admin/feedback" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setShowDropdown(false)}
          >
            Reports
          </Link>
          <Link 
            href="/admin/logs" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setShowDropdown(false)}
          >
            System Logs
          </Link>
        </div>
      )}
    </div>
  );
} 