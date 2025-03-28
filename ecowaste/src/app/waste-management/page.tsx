"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function WasteManagementPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState("segregation");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-green-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold flex items-center">
            <span className="mr-2">♻️</span> EcoWaste Solutions
          </Link>
          <div className="flex items-center gap-6">
            <Link href="#solutions" className="hover:underline">Solutions</Link>
            <Link href="#benefits" className="hover:underline">Benefits</Link>
            <Link href="#contact" className="hover:underline">Contact</Link>
            {isLoaded && isSignedIn ? (
              <div className="flex items-center gap-4">
                <Link 
                  href="/waste-management/propose" 
                  className="bg-white text-green-600 px-4 py-2 rounded-md font-medium hover:bg-green-100"
                >
                  Propose Project
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <Link 
                href="/sign-in" 
                className="bg-white text-green-600 px-4 py-2 rounded-md font-medium hover:bg-green-100"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-500 to-green-700 text-white py-20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Sustainable Waste Management Solutions</h1>
            <p className="text-xl mb-6">
              Transforming communities through effective waste segregation, 
              responsible disposal, and improved sanitization systems.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#solutions" className="bg-white text-green-600 hover:bg-green-100 px-6 py-3 rounded-md font-bold text-center">
                Explore Solutions
              </a>
              {isSignedIn ? (
                <Link 
                  href="/waste-management/propose" 
                  className="bg-transparent border-2 border-white hover:bg-white hover:text-green-600 px-6 py-3 rounded-md font-bold text-center"
                >
                  Propose a Project
                </Link>
              ) : (
                <a href="#contact" className="bg-transparent border-2 border-white hover:bg-white hover:text-green-600 px-6 py-3 rounded-md font-bold text-center">
                  Contact Us
                </a>
              )}
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-lg h-80">
              <div className="absolute inset-0 flex items-center justify-center">
                <Image 
                  src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=3270&auto=format&fit=crop"
                  alt="Waste Management Hero" 
                  width={600} 
                  height={400}
                  className="rounded-lg shadow-2xl object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Our Solutions</h2>
          
          {/* Tabs */}
          <div className="flex flex-wrap justify-center mb-8 gap-2">
            {["segregation", "disposal", "sanitization"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 hover:bg-green-100"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {activeTab === "segregation" && (
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 pr-8">
                  <h3 className="text-2xl font-bold mb-4">Waste Segregation</h3>
                  <p className="mb-4">
                    Our waste segregation solutions help communities properly sort waste at the source, 
                    making recycling and disposal more efficient and environmentally friendly.
                  </p>
                  <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>Color-coded bins for different waste types</li>
                    <li>Educational programs for communities</li>
                    <li>Smart segregation systems with IoT monitoring</li>
                    <li>Mobile apps for waste identification and sorting guides</li>
                    <li>Incentive programs for proper waste segregation</li>
                  </ul>
                  <Link 
                    href="/waste-management/propose?category=segregation" 
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 inline-block"
                  >
                    Propose a Solution
                  </Link>
                </div>
                <div className="md:w-1/2 mt-6 md:mt-0">
                  <Image 
                    src="https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=3281&auto=format&fit=crop"
                    alt="Waste Segregation" 
                    width={500} 
                    height={300}
                    className="rounded-lg shadow-md object-cover w-full h-64"
                  />
                </div>
              </div>
            )}
            
            {activeTab === "disposal" && (
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 pr-8">
                  <h3 className="text-2xl font-bold mb-4">Waste Disposal</h3>
                  <p className="mb-4">
                    Our responsible waste disposal solutions ensure that waste is handled 
                    properly after collection, minimizing environmental impact.
                  </p>
                  <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>Composting systems for organic waste</li>
                    <li>Recycling programs for various materials</li>
                    <li>Safe disposal of hazardous waste</li>
                    <li>Waste-to-energy conversion technologies</li>
                    <li>Community-based collection and disposal networks</li>
                  </ul>
                  <Link 
                    href="/waste-management/propose?category=disposal" 
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 inline-block"
                  >
                    Propose a Solution
                  </Link>
                </div>
                <div className="md:w-1/2 mt-6 md:mt-0">
                  <Image 
                    src="https://images.unsplash.com/photo-1604187351574-c75ca79f5807?q=80&w=3270&auto=format&fit=crop"
                    alt="Waste Disposal" 
                    width={500} 
                    height={300}
                    className="rounded-lg shadow-md object-cover w-full h-64"
                  />
                </div>
              </div>
            )}
            
            {activeTab === "sanitization" && (
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 pr-8">
                  <h3 className="text-2xl font-bold mb-4">Improved Sanitization</h3>
                  <p className="mb-4">
                    Our sanitization solutions improve public health and hygiene by 
                    ensuring clean environments and proper waste handling.
                  </p>
                  <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>Public space cleaning and sanitization services</li>
                    <li>Water treatment and wastewater management</li>
                    <li>Advanced sanitization technologies for waste facilities</li>
                    <li>Clean community programs and education</li>
                    <li>Public toilet maintenance and sanitation systems</li>
                  </ul>
                  <Link 
                    href="/waste-management/propose?category=sanitization" 
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 inline-block"
                  >
                    Propose a Solution
                  </Link>
                </div>
                <div className="md:w-1/2 mt-6 md:mt-0">
                  <Image 
                    src="https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=3270&auto=format&fit=crop"
                    alt="Sanitization Systems" 
                    width={500} 
                    height={300}
                    className="rounded-lg shadow-md object-cover w-full h-64"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Benefits of Our Solutions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mb-4 text-2xl">
                🌿
              </div>
              <h3 className="text-xl font-bold mb-2">Environmental Impact</h3>
              <p>
                Reduce pollution, conserve resources, and minimize the ecological footprint 
                of waste through our comprehensive management solutions.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mb-4 text-2xl">
                👨‍👩‍👧‍👦
              </div>
              <h3 className="text-xl font-bold mb-2">Community Health</h3>
              <p>
                Improve public health by reducing disease vectors, enhancing cleanliness, 
                and creating more hygienic living environments.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mb-4 text-2xl">
                💰
              </div>
              <h3 className="text-xl font-bold mb-2">Economic Benefits</h3>
              <p>
                Create jobs in waste management, reduce costs through resource recovery, 
                and build new value chains from recycled materials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 bg-green-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join our community of changemakers who are transforming waste management practices. 
            Submit your project proposal today and help create a cleaner, healthier environment.
          </p>
          <Link 
            href="/waste-management/propose" 
            className="bg-white text-green-600 px-8 py-3 rounded-md font-bold text-lg hover:bg-green-100 inline-block"
          >
            Submit Your Proposal
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-100">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Contact Us</h2>
          
          <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:w-1/2 p-8">
              <h3 className="text-2xl font-bold mb-4">Get in Touch</h3>
              <p className="mb-6">
                Interested in implementing our waste management solutions in your community? 
                Fill out this form and we'll get back to you soon.
              </p>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="name">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="Your Name"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="email">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
            
            <div className="md:w-1/2 bg-green-600 text-white p-8 flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-6">Our Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="mr-4 mt-1">📍</div>
                  <div>
                    <h4 className="font-bold">Address</h4>
                    <p>123 Green Street, Eco City, EC 12345</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 mt-1">✉️</div>
                  <div>
                    <h4 className="font-bold">Email</h4>
                    <p>info@ecowastesolutions.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 mt-1">📞</div>
                  <div>
                    <h4 className="font-bold">Phone</h4>
                    <p>+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 mt-1">⏰</div>
                  <div>
                    <h4 className="font-bold">Working Hours</h4>
                    <p>Monday - Friday: 9am - 5pm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">♻️</span> EcoWaste Solutions
              </h3>
              <p className="max-w-md">
                Transforming communities through effective waste management solutions. 
                Together, we can create a cleaner, healthier planet.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-bold mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-green-400">Home</a></li>
                  <li><a href="#solutions" className="hover:text-green-400">Solutions</a></li>
                  <li><a href="#benefits" className="hover:text-green-400">Benefits</a></li>
                  <li><a href="#contact" className="hover:text-green-400">Contact</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-bold mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  <a href="#" className="hover:text-green-400">Twitter</a>
                  <a href="#" className="hover:text-green-400">Facebook</a>
                  <a href="#" className="hover:text-green-400">Instagram</a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-6 text-sm text-center">
            &copy; {new Date().getFullYear()} EcoWaste Solutions. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
} 