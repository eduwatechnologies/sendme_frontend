"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, UserPlus, MapPin, Shield, Zap, Package, Clock, Star } from "lucide-react";

export default function LandingPage() {
  const words = ["food", "groceries", "packages", "documents", "laundry", "medication"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">sendMe</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/signin" 
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/become-runner"
              className="hidden rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 sm:block"
            >
              Become a Runner
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col">
        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
          
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
              <div className="mb-8 flex">
                <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 dark:text-gray-300 dark:ring-zinc-700 dark:hover:ring-zinc-600">
                  Now available in major cities.{" "}
                  <Link href="#" className="font-semibold text-blue-600">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Read more <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
              <h1 className="mt-10 max-w-lg text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-white">
                Get <span className="text-blue-600 inline-block min-w-[120px] text-left transition-all duration-300">{words[currentWordIndex]}</span>
                <br />
                delivered by nearby runners
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                Connect with trusted local runners who can pick up, drop off, and deliver anything you need. Fast, secure, and right to your doorstep.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <Link
                  href="/dashboard"
                  className="rounded-full bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Find an Errand Runner <ArrowRight className="ml-2 inline-block h-4 w-4" />
                </Link>
                <Link
                  href="/become-runner"
                  className="text-sm font-semibold leading-6 text-gray-900 dark:text-white"
                >
                  Become a Runner <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
            <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow">
              <div className="relative mx-auto w-[22rem] max-w-full drop-shadow-xl lg:mr-0 lg:ml-auto lg:w-[32rem]">
                {/* Decorative Map Background */}
                <div className="absolute -top-12 -right-12 -z-10 h-[400px] w-[400px] rounded-full bg-blue-50 opacity-50 blur-3xl dark:bg-blue-900/20"></div>
                
                {/* Map Image */}
                <div className="relative overflow-hidden rounded-2xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                   <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                    alt="Map view"
                    className="w-full rounded-xl shadow-2xl ring-1 ring-gray-900/10 object-cover h-[300px] opacity-80"
                  />
                  
                  {/* Floating Delivery Runner Card */}
                  <div className="absolute -bottom-10 -left-6 rounded-xl bg-white p-4 shadow-lg ring-1 ring-gray-900/5 dark:bg-zinc-800 dark:ring-zinc-700 max-w-xs w-64 transform transition-transform hover:scale-105 duration-300">
                    <div className="flex items-center gap-4">
                      <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
                        alt="Delivery Runner" 
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">David K.</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Nearby Runner • 0.5km</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-zinc-700">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">4.9 (128)</span>
                      </div>
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full dark:bg-blue-900/30 dark:text-blue-400">Available</span>
                    </div>
                  </div>

                   {/* Floating Delivery Item Image */}
                   <div className="absolute -top-6 -right-6 rounded-xl overflow-hidden shadow-lg ring-1 ring-gray-900/5 w-32 h-32 transform rotate-6 hover:rotate-0 transition-transform duration-300">
                      <img 
                        src="https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                        alt="Delivery Package"
                        className="h-full w-full object-cover"
                      />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-50 py-24 dark:bg-zinc-900">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-600">Deliver Faster</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                Everything you need for quick deliveries
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                <div className="flex flex-col items-start">
                  <div className="rounded-lg bg-blue-600 p-2 ring-1 ring-blue-600">
                    <MapPin className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <dt className="mt-4 font-semibold text-gray-900 dark:text-white">Real-time Tracking</dt>
                  <dd className="mt-2 leading-7 text-gray-600 dark:text-gray-400">
                    Watch your runner on the map in real-time. Know exactly when your items will arrive.
                  </dd>
                </div>
                <div className="flex flex-col items-start">
                  <div className="rounded-lg bg-blue-600 p-2 ring-1 ring-blue-600">
                    <Shield className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <dt className="mt-4 font-semibold text-gray-900 dark:text-white">Secure Payments</dt>
                  <dd className="mt-2 leading-7 text-gray-600 dark:text-gray-400">
                    Payments are held in escrow until you confirm you've received your delivery.
                  </dd>
                </div>
                <div className="flex flex-col items-start">
                  <div className="rounded-lg bg-blue-600 p-2 ring-1 ring-blue-600">
                    <Zap className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <dt className="mt-4 font-semibold text-gray-900 dark:text-white">Lightning Fast</dt>
                  <dd className="mt-2 leading-7 text-gray-600 dark:text-gray-400">
                    Connect with the nearest available runner to get your errands done in minutes.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* How it Works Section */}
        <div className="py-24 sm:py-32 dark:bg-zinc-950">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">How it works</h2>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
                Getting started is easy. Here's how sendMe connects you with local runners.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 overflow-hidden lg:mx-0 lg:max-w-none lg:grid-cols-3">
              <div className="relative rounded-2xl bg-gray-50 p-8 dark:bg-zinc-900">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold">1</div>
                <h3 className="text-lg font-semibold leading-8 text-gray-900 dark:text-white">Post your request</h3>
                <p className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                  Tell us what you need, where to get it, and where to deliver it.
                </p>
              </div>
              <div className="relative rounded-2xl bg-gray-50 p-8 dark:bg-zinc-900">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold">2</div>
                <h3 className="text-lg font-semibold leading-8 text-gray-900 dark:text-white">Match with a runner</h3>
                <p className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                  We'll connect you with a nearby verified runner who is ready to help.
                </p>
              </div>
              <div className="relative rounded-2xl bg-gray-50 p-8 dark:bg-zinc-900">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold">3</div>
                <h3 className="text-lg font-semibold leading-8 text-gray-900 dark:text-white">Track & Receive</h3>
                <p className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                  Track your runner in real-time and pay securely upon delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 dark:bg-zinc-950 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <p className="text-center text-xs leading-5 text-gray-500 dark:text-gray-400">
              &copy; 2024 sendMe, Inc. All rights reserved.
            </p>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <Package className="h-5 w-5 text-gray-900 dark:text-white" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">sendMe</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}