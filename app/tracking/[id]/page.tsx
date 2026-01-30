"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Clock, MapPin, Package, Phone, User } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAppDispatch, useAppSelector } from "../../../lib/hooks";
import { fetchErrandById } from "../../../lib/features/errands/errandSlice";

const STATUS_STEPS = [
  { id: 'Pending', name: 'Pending', icon: Clock },
  { id: 'In Progress', name: 'In Progress', icon: MapPin },
  { id: 'Completed', name: 'Completed', icon: CheckCircle },
];

export default function OrderTracking({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const dispatch = useAppDispatch();
  
  // Find errand in store or fetch it
  const { errands, isLoading } = useAppSelector((state) => state.errands);
  const errand = errands.find(e => e._id === id);

  useEffect(() => {
    if (!errand) {
      dispatch(fetchErrandById(id));
    }
  }, [dispatch, id, errand]);

  if (isLoading && !errand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading tracking info...</p>
      </div>
    );
  }

  if (!errand) {
      return (
        <div className="min-h-screen flex items-center justify-center flex-col gap-4">
            <p className="text-gray-500">Errand not found</p>
            <Link href="/dashboard" className="text-blue-600 hover:underline">Return to Dashboard</Link>
        </div>
      );
  }

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === errand.status);
  const currentStep = currentStepIndex === -1 ? 0 : currentStepIndex;

  return (
    <ProtectedRoute allowedRoles={['user']}>
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-zinc-900">
      <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
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
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Order Tracking</h1>
                    {errand.trackingId && (
                        <span className="text-xs font-mono bg-gray-100 dark:bg-zinc-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                            #{errand.trackingId}
                        </span>
                    )}
                </div>
                
                {/* Runner Info */}
                {errand.runner ? (
                    <div className="flex items-center mb-8 p-4 bg-gray-50 rounded-lg dark:bg-zinc-700">
                        {errand.runner.photo ? (
                            <img
                                className="h-12 w-12 rounded-full"
                                src={errand.runner.photo}
                                alt={errand.runner.name}
                            />
                        ) : (
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                {errand.runner.name?.charAt(0) || 'R'}
                            </div>
                        )}
                        <div className="ml-4 flex-1">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{errand.runner.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Your Runner</p>
                        </div>
                        <Link href={`/chat?userId=${errand.runner._id}&userName=${errand.runner.name}`} className="rounded-full bg-blue-100 p-2 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400">
                            <Phone className="h-5 w-5" />
                        </Link>
                    </div>
                ) : (
                    <div className="flex items-center mb-8 p-4 bg-yellow-50 rounded-lg dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30">
                        <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center dark:bg-yellow-900/40">
                            <User className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="ml-4 flex-1">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Waiting for Runner</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">We are looking for a nearby runner...</p>
                        </div>
                    </div>
                )}

                {/* Timeline */}
                <nav aria-label="Progress">
                    <ol role="list" className="overflow-hidden">
                        {STATUS_STEPS.map((step, stepIdx) => {
                            const Icon = step.icon;
                            const isComplete = stepIdx < currentStep;
                            const isCurrent = stepIdx === currentStep;

                            return (
                                <li key={step.name} className={`relative ${stepIdx !== STATUS_STEPS.length - 1 ? 'pb-10' : ''}`}>
                                    {stepIdx !== STATUS_STEPS.length - 1 ? (
                                        <div
                                            className={`absolute left-4 top-4 -ml-px h-full w-0.5 ${
                                                isComplete ? 'bg-blue-600' : 'bg-gray-200 dark:bg-zinc-600'
                                            }`}
                                            aria-hidden="true"
                                        />
                                    ) : null}
                                    <div className="relative flex items-start group">
                                        <span className="flex h-9 items-center">
                                            <span
                                                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                                                    isComplete || isCurrent
                                                        ? 'bg-blue-600'
                                                        : 'bg-gray-100 dark:bg-zinc-700'
                                                }`}
                                            >
                                                <Icon className={`h-5 w-5 ${isComplete || isCurrent ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                                            </span>
                                        </span>
                                        <span className="ml-4 flex min-w-0 flex-col">
                                            <span className={`text-sm font-medium ${isComplete || isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {step.name}
                                            </span>
                                        </span>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </nav>
                
                {errand.status === 'Completed' && (
                     <div className="mt-8 text-center">
                        <p className="text-green-600 font-semibold mb-4">Order Delivered!</p>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                        >
                            Back to Home
                        </Link>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
