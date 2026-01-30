"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function PaymentScreen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const serviceFee = 2.50; // Fixed fee for MVP

  const formik = useFormik({
    initialValues: {
      amount: "",
    },
    validationSchema: Yup.object({
      amount: Yup.number()
        .typeError("Amount must be a number")
        .positive("Amount must be positive")
        .required("Amount is required"),
    }),
    onSubmit: (values) => {
      setIsProcessing(true);
      
      // Simulate payment processing
      setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);
        
        // Redirect to tracking after a delay
        setTimeout(() => {
            router.push(`/tracking/${id}`);
        }, 2000);
      }, 1500);
    },
  });

  const total = formik.values.amount ? parseFloat(formik.values.amount) + serviceFee : 0;

  if (isSuccess) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center dark:bg-zinc-900">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Payment Successful!</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Redirecting to order tracking...</p>
        </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['user']}>
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-zinc-900">
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href={`/chat/${id}`}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Chat
          </Link>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-zinc-800">
            <div className="px-4 py-5 sm:p-6">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Payment Details</h1>
                
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Amount to Send ($)
                        </label>
                        <div className="relative mt-1 rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                                type="number"
                                {...formik.getFieldProps('amount')}
                                className={`block w-full rounded-md border pl-7 pr-12 focus:ring-blue-500 sm:text-sm dark:bg-zinc-700 dark:text-white ${
                                  formik.touched.amount && formik.errors.amount
                                    ? "border-red-300 focus:border-red-500"
                                    : "border-gray-300 focus:border-blue-500 dark:border-zinc-600"
                                }`}
                                placeholder="0.00"
                            />
                        </div>
                        {formik.touched.amount && formik.errors.amount && (
                          <p className="mt-1 text-sm text-red-600">{formik.errors.amount}</p>
                        )}
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Service Fee</span>
                        <span>${serviceFee.toFixed(2)}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 dark:border-zinc-700">
                         <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={!formik.isValid || !formik.dirty || isProcessing}
                        className={`w-full flex justify-center items-center rounded-md px-4 py-3 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                            !formik.isValid || !formik.dirty || isProcessing 
                            ? "bg-gray-400 cursor-not-allowed" 
                            : "bg-blue-600 hover:bg-blue-500"
                        }`}
                    >
                        {isProcessing ? "Processing..." : (
                            <>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Pay ${total.toFixed(2)}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
