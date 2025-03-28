"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-500 to-green-700 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Creating a Sustainable Future Through Smart Waste Management
              </h1>
              <p className="text-xl mb-8">
                Join us in transforming waste management practices for a cleaner, 
                healthier environment. Explore our solutions and make a difference today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/waste-management"
                  className="bg-white text-green-600 px-8 py-3 rounded-md font-bold text-lg hover:bg-green-100 text-center"
                >
                  Explore Solutions
                </Link>
                {isSignedIn ? (
                  <Link
                    href="/waste-management/propose"
                    className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-md font-bold text-lg hover:bg-white hover:text-green-600 text-center"
                  >
                    Propose a Project
                  </Link>
                ) : (
                  <Link
                    href="/sign-in"
                    className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-md font-bold text-lg hover:bg-white hover:text-green-600 text-center"
                  >
                    Get Started
                  </Link>
                )}
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <Image
                src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b"
                alt="Sustainable Waste Management"
                width={600}
                height={400}
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Our Solutions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">♻️</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Waste Segregation</h3>
              <p className="text-gray-600 mb-4">
                Smart solutions for efficient waste sorting and recycling at source.
              </p>
              <Link
                href="/waste-management#solutions"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Learn More →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🗑️</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Waste Disposal</h3>
              <p className="text-gray-600 mb-4">
                Environmentally responsible waste disposal and treatment methods.
              </p>
              <Link
                href="/waste-management#solutions"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Learn More →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🧹</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Sanitization</h3>
              <p className="text-gray-600 mb-4">
                Advanced sanitization solutions for public health and hygiene.
              </p>
              <Link
                href="/waste-management#solutions"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Learn More →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community of changemakers and help create a sustainable future 
            through innovative waste management solutions.
          </p>
          <Link
            href="/waste-management/propose"
            className="bg-white text-green-600 px-8 py-3 rounded-md font-bold text-lg hover:bg-green-100 inline-block"
          >
            Start Your Project
          </Link>
        </div>
      </section>
    </main>
  );
}
