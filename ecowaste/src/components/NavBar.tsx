"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { AdminNavLink } from "@/components/AdminNavLink";

interface NavLink {
  name: string;
  href: string;
}

const mainNavLinks: NavLink[] = [
  { name: "Home", href: "/" },
  { name: "Waste Management", href: "/waste-management" },
];

const userNavLinks: NavLink[] = [
  { name: "Propose Project", href: "/waste-management/propose" },
  { name: "My Projects", href: "/waste-management/my-projects" },
  { name: "Report Issue", href: "/feedback/report" },
  { name: "My Reports", href: "/dashboard/my-reports" },
];

export default function NavBar() {
  const { isLoaded, isSignedIn } = useUser();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Handle scroll event for navbar transparency
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setHasScrolled(scrollPosition > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if the link is active
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        hasScrolled ? "bg-white shadow-md py-2" : "bg-white/95 py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 mr-2 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-800">EcoWaste Solutions</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <div className="hidden md:flex items-center space-x-1">
              {mainNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(link.href)
                      ? "text-green-700 bg-green-50"
                      : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {isLoaded && isSignedIn && (
                <>
                  {userNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        isActive(link.href)
                          ? "text-green-700 bg-green-50"
                          : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </>
              )}
            </div>
            <div className="ml-4 flex items-center">
              <AdminNavLink />

              {isLoaded && isSignedIn && (
                <Link 
                  href="/admin/setup"
                  className="px-3 py-2 mr-2 rounded-md text-xs font-medium text-gray-500 hover:text-green-600 hover:bg-green-50"
                  title="Setup Admin Access"
                >
                  <span className="hidden md:inline">Admin Setup</span>
                  <span className="md:hidden">Setup</span>
                </Link>
              )}

              {isLoaded && isSignedIn ? (
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-8 h-8",
                    },
                  }}
                />
              ) : (
                <Link
                  href="/sign-in"
                  className="ml-4 px-4 py-2 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isOpen ? "block" : "hidden"} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
          {mainNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(link.href)
                  ? "text-green-700 bg-green-50"
                  : "text-gray-700 hover:text-green-600 hover:bg-green-50"
              }`}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          {isLoaded && isSignedIn ? (
            <>
              {userNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(link.href)
                      ? "text-green-700 bg-green-50"
                      : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-5">
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">Your Account</div>
                  </div>
                  <div className="ml-auto">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <Link
              href="/sign-in"
              className="block w-full text-center px-3 py-2 rounded-md text-base font-medium bg-green-600 text-white hover:bg-green-700"
              onClick={() => setIsOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
} 