"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

type Visibility = "public" | "private" | "moderated";
type Category = "segregation" | "disposal" | "sanitization" | "other";

export default function ProposeProjectPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("other");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("moderated");
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignedIn) {
      setError("You must be signed in to submit a project proposal");
      return;
    }
    
    setError("");
    setIsSubmitting(true);
    
    try {
      // Double-check authentication before making the API call
      if (!user || !isSignedIn) {
        setError("Your session has expired. Please sign in again.");
        setTimeout(() => {
          router.push("/sign-in?redirect_url=/waste-management/propose");
        }, 2000);
        setIsSubmitting(false);
        return;
      }
      
      // Force refresh user session first to ensure token is valid
      try {
        if (user?.reload) {
          await user.reload();
          console.log("User session refreshed");
        }
      } catch (reloadErr) {
        console.error("Failed to refresh user session:", reloadErr);
      }
      
      const response = await fetch("/api/waste-management/propose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          category,
          location,
          budget: parseFloat(budget),
          timeline,
          contactName: contactName || user?.fullName || "",
          contactEmail: contactEmail || user?.primaryEmailAddress?.emailAddress || "",
          contactPhone: contactPhone || undefined,
          visibility,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.error === "Authentication required") {
          setError("Your session has expired. Please sign in again.");
          setTimeout(() => {
            router.push("/sign-in?redirect_url=/waste-management/propose");
          }, 2000);
        } else {
          throw new Error(data.error || "Failed to submit project proposal");
        }
        return;
      }
      
      // Reset form and show success message
      setSuccess(true);
      setTitle("");
      setDescription("");
      setCategory("other");
      setLocation("");
      setBudget("");
      setTimeline("");
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setVisibility("moderated");
      
      // Redirect to success page after a delay
      setTimeout(() => {
        router.push("/waste-management");
      }, 3000);
      
    } catch (err) {
      console.error("Error submitting project:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg text-center">
        <h1 className="text-3xl font-bold mb-6">Sign In Required</h1>
        <p className="mb-8">Please sign in to propose a new waste management project.</p>
        <button
          onClick={() => router.push("/sign-in")}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
        >
          Sign In
        </button>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <svg
              className="h-12 w-12 text-green-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4">Proposal Submitted!</h1>
        <p className="mb-8 text-gray-600">
          Your project proposal has been successfully submitted.
          {visibility === "moderated" && " It will be reviewed by our team before being published."}
        </p>
        <p className="text-gray-600">
          Redirecting you back to the waste management page...
        </p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Propose a New Project</h1>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Project Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter a clear, descriptive title"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Describe your project in detail including goals, expected impact, and implementation plan"
          />
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="segregation">Waste Segregation</option>
            <option value="disposal">Waste Disposal</option>
            <option value="sanitization">Sanitization</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Where will this project be implemented?"
          />
        </div>
        
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
            Budget (in USD)
          </label>
          <input
            type="number"
            id="budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Estimated budget required"
          />
        </div>
        
        <div>
          <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-1">
            Timeline
          </label>
          <input
            type="text"
            id="timeline"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="E.g. 3 months, 1 year, etc."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Name
            </label>
            <input
              type="text"
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Your name or organization name"
            />
          </div>
          
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              id="contactEmail"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Email for project inquiries"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
            Contact Phone (optional)
          </label>
          <input
            type="tel"
            id="contactPhone"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Phone number for project inquiries"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Visibility
          </label>
          <div className="space-y-3">
            <div className="flex items-start">
              <input
                type="radio"
                id="visibility-public"
                name="visibility"
                value="public"
                checked={visibility === "public"}
                onChange={() => setVisibility("public")}
                className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="visibility-public" className="ml-3">
                <span className="block text-sm font-medium text-gray-700">Public</span>
                <span className="block text-sm text-gray-500">Everyone can see your project</span>
              </label>
            </div>
            
            <div className="flex items-start">
              <input
                type="radio"
                id="visibility-private"
                name="visibility"
                value="private"
                checked={visibility === "private"}
                onChange={() => setVisibility("private")}
                className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="visibility-private" className="ml-3">
                <span className="block text-sm font-medium text-gray-700">Private</span>
                <span className="block text-sm text-gray-500">Only you and administrators can see your project</span>
              </label>
            </div>
            
            <div className="flex items-start">
              <input
                type="radio"
                id="visibility-moderated"
                name="visibility"
                value="moderated"
                checked={visibility === "moderated"}
                onChange={() => setVisibility("moderated")}
                className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="visibility-moderated" className="ml-3">
                <span className="block text-sm font-medium text-gray-700">Moderated</span>
                <span className="block text-sm text-gray-500">Administrators will review before making it public</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Proposal"}
          </button>
        </div>
      </form>
    </div>
  );
} 