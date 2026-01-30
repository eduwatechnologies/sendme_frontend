import Link from "next/link";
import { MapPin, Star, MessageCircle, ArrowLeft } from "lucide-react";
import { MOCK_RUNNERS } from "@/data/mocks";
import { notFound } from "next/navigation";

export default async function RunnerProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const runner = MOCK_RUNNERS.find((r) => r.id === id);

  if (!runner) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-zinc-900">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-zinc-800">
          <div className="h-32 bg-blue-600 sm:h-48"></div>
          <div className="relative px-6 pb-6">
            <div className="-mt-16 sm:-mt-24">
              <img
                className="h-32 w-32 rounded-full ring-4 ring-white sm:h-48 sm:w-48 dark:ring-zinc-800"
                src={runner.photo}
                alt={runner.name}
              />
            </div>
            <div className="mt-6 sm:flex sm:items-end sm:justify-between">
              <div className="sm:flex-1">
                <div>
                  <div className="flex items-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {runner.name}
                    </h1>
                    <span
                      className={`ml-4 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        runner.availability === "Available"
                          ? "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-900/10"
                          : "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-900/10"
                      }`}
                    >
                      {runner.availability}
                    </span>
                  </div>
                  <p className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                    {runner.location} • {runner.distance} away
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:mt-0 sm:flex-row">
                <Link
                  href={`/chat/${runner.id}`}
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Chat
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 px-6 py-6 dark:border-zinc-700">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Rating
                </dt>
                <dd className="mt-1 flex items-center text-sm text-gray-900 dark:text-white">
                  <Star className="mr-1.5 h-5 w-5 text-yellow-400" />
                  <span className="font-semibold">{runner.rating}</span>
                  <span className="ml-1 text-gray-500 dark:text-gray-400">
                    ({runner.reviewsCount} reviews)
                  </span>
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Completed Errands
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {runner.completedErrands}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  About
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  Reliable errand runner with experience in grocery shopping, food delivery, and package pickup. Fast and communicative.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
