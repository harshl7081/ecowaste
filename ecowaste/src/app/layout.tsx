import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { AdminNavLink } from "@/components/AdminNavLink";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EcoWaste Solutions",
  description: "Sustainable waste management solutions for a cleaner future",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <nav className="bg-white shadow-sm">
            <div className="container mx-auto px-4 py-3">
              <div className="flex justify-between items-center">
                <Link href="/" className="text-xl font-bold text-gray-800">
                  EcoWaste Solutions
                </Link>
                <div className="flex items-center gap-4">
                  <Link 
                    href="/waste-management" 
                    className="text-gray-600 hover:text-green-600"
                  >
                    Waste Management
                  </Link>
                  <Link 
                    href="/waste-management/propose" 
                    className="text-gray-600 hover:text-green-600"
                  >
                    Propose Project
                  </Link>
                  <Link 
                    href="/waste-management/my-projects" 
                    className="text-gray-600 hover:text-green-600"
                  >
                    My Projects
                  </Link>
                  <Link 
                    href="/feedback/report" 
                    className="text-gray-600 hover:text-green-600"
                  >
                    Report Issue
                  </Link>
                  <Link 
                    href="/dashboard/my-reports" 
                    className="text-gray-600 hover:text-green-600"
                  >
                    My Reports
                  </Link>
                  <AdminNavLink />
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            </div>
          </nav>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
