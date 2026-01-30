"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, UserPlus, Bike, Clock, DollarSign, Upload, Shield } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../lib/hooks";
import { registerUser } from "../../lib/features/auth/authSlice";
import api from "../../lib/axios";

export default function BecomeRunner() {
  const dispatch = useAppDispatch();
  const { isLoading: isAuthLoading } = useAppSelector((state) => state.auth);
  const [isSuccess, setIsSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      phone: "",
      relativePhone: "",
      location: "",
      vehicle: "bicycle",
      bio: "",
      nationalId: "",
      nationalSlipImage: null as File | null,
      photo: null as File | null,
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required("Full Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
      phone: Yup.string().required("Phone number is required"),
      relativePhone: Yup.string().required("Next of Kin Phone is required"),
      location: Yup.string().required("Location is required"),
      vehicle: Yup.string().required("Vehicle type is required"),
      nationalId: Yup.string().required("National ID Number is required"),
      nationalSlipImage: Yup.mixed().required("National Slip Image is required"),
      photo: Yup.mixed().required("Selfie Photo is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // 1. Signup User using Redux
        const resultAction = await dispatch(registerUser({
            name: values.fullName,
            email: values.email,
            password: values.password,
            role: 'runner'
        }));

        if (registerUser.rejected.match(resultAction)) {
            throw new Error(resultAction.payload as string || 'Signup failed');
        }

        const user = resultAction.payload.user;

        // 2. Submit Runner Application using Axios
        const runnerData = new FormData();
        runnerData.append('userId', user.id);
        runnerData.append('vehicleType', values.vehicle);
        runnerData.append('location', values.location);
        runnerData.append('relativePhone', values.relativePhone);
        runnerData.append('nationalId', values.nationalId);
        if (values.nationalSlipImage) runnerData.append('nationalSlipImage', values.nationalSlipImage);
        if (values.photo) runnerData.append('photo', values.photo);

        await api.post('/runner/apply', runnerData);

        setIsSuccess(true);
      } catch (err: any) {
        console.error(err);
        alert(err.message || err.response?.data?.message || 'Application failed');
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center dark:bg-zinc-900">
        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
            <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Application Received!</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Thanks for applying to be a runner. Your account has been created and you can now start accepting errands.
        </p>
        <Link
          href="/runner-dashboard"
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-blue-500 hover:shadow-xl transition-all"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
       {/* Header */}
       <div className="max-w-4xl mx-auto mb-10 text-center">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-5xl mb-4">
             Become a <span className="text-blue-600">Runner</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
             Join thousands of runners earning on their own schedule. Simple sign up, quick verification, and weekly payouts.
          </p>
       </div>

       {/* Main Form Container */}
       <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
          {/* Progress / Steps Indicator (Visual Only) */}
          <div className="bg-gray-50 dark:bg-zinc-800/50 px-8 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
             <div className="flex items-center gap-2 text-blue-600 font-medium">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">1</div>
                Application Details
             </div>
             <div className="hidden sm:block h-px w-12 bg-gray-200 dark:bg-zinc-700"></div>
             <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-zinc-700 text-gray-500 text-xs font-bold">2</div>
                Verification
             </div>
             <div className="hidden sm:block h-px w-12 bg-gray-200 dark:bg-zinc-700"></div>
             <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-zinc-700 text-gray-500 text-xs font-bold">3</div>
                Approval
             </div>
          </div>

          <div className="p-8 sm:p-10">
            <form onSubmit={formik.handleSubmit} className="space-y-10">
                
                {/* Section 1: Personal Info */}
                <div className="space-y-6">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                         <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h3>
                   </div>
                   
                   <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                            <input
                                type="text"
                                {...formik.getFieldProps('fullName')}
                                className={`block w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-white ${
                                  formik.touched.fullName && formik.errors.fullName ? 'border-red-500' : ''
                                }`}
                                placeholder="e.g. David Mark"
                            />
                            {formik.touched.fullName && formik.errors.fullName && (
                              <div className="text-red-500 text-sm mt-1">{formik.errors.fullName}</div>
                            )}
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                            <input
                                type="email"
                                {...formik.getFieldProps('email')}
                                className={`block w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-white ${
                                  formik.touched.email && formik.errors.email ? 'border-red-500' : ''
                                }`}
                                placeholder="name@example.com"
                            />
                            {formik.touched.email && formik.errors.email && (
                              <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
                            )}
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Create Password</label>
                            <input
                                type="password"
                                {...formik.getFieldProps('password')}
                                className={`block w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-white ${
                                  formik.touched.password && formik.errors.password ? 'border-red-500' : ''
                                }`}
                                placeholder="Min. 6 characters"
                            />
                            {formik.touched.password && formik.errors.password && (
                              <div className="text-red-500 text-sm mt-1">{formik.errors.password}</div>
                            )}
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                            <input
                                type="tel"
                                {...formik.getFieldProps('phone')}
                                className={`block w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-white ${
                                  formik.touched.phone && formik.errors.phone ? 'border-red-500' : ''
                                }`}
                                placeholder="+234..."
                            />
                            {formik.touched.phone && formik.errors.phone && (
                              <div className="text-red-500 text-sm mt-1">{formik.errors.phone}</div>
                            )}
                        </div>
                   </div>
                </div>

                <div className="h-px bg-gray-100 dark:bg-zinc-800"></div>

                {/* Section 2: Details & Verification */}
                <div className="space-y-6">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                         <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Runner Details</h3>
                   </div>

                   <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">City / Location</label>
                            <input
                                type="text"
                                {...formik.getFieldProps('location')}
                                className={`block w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-white ${
                                  formik.touched.location && formik.errors.location ? 'border-red-500' : ''
                                }`}
                                placeholder="Where will you work?"
                            />
                            {formik.touched.location && formik.errors.location && (
                              <div className="text-red-500 text-sm mt-1">{formik.errors.location}</div>
                            )}
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                             <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Vehicle Type</label>
                             <div className="relative">
                                <select
                                    {...formik.getFieldProps('vehicle')}
                                    className={`block w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-white ${
                                      formik.touched.vehicle && formik.errors.vehicle ? 'border-red-500' : ''
                                    }`}
                                >
                                    <option value="bicycle">🚲 Bicycle</option>
                                    <option value="motorbike">🏍️ Motorbike</option>
                                    <option value="car">🚗 Car</option>
                                    <option value="none">🚶 Walker / Public Transit</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                </div>
                             </div>
                             {formik.touched.vehicle && formik.errors.vehicle && (
                               <div className="text-red-500 text-sm mt-1">{formik.errors.vehicle}</div>
                             )}
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                             <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Next of Kin Phone</label>
                             <input
                                type="tel"
                                {...formik.getFieldProps('relativePhone')}
                                className={`block w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-white ${
                                  formik.touched.relativePhone && formik.errors.relativePhone ? 'border-red-500' : ''
                                }`}
                                placeholder="For emergency contact"
                             />
                             {formik.touched.relativePhone && formik.errors.relativePhone && (
                               <div className="text-red-500 text-sm mt-1">{formik.errors.relativePhone}</div>
                             )}
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                             <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">National ID Number</label>
                             <input
                                type="text"
                                {...formik.getFieldProps('nationalId')}
                                className={`block w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-white ${
                                  formik.touched.nationalId && formik.errors.nationalId ? 'border-red-500' : ''
                                }`}
                                placeholder="e.g. 12345678901"
                             />
                             {formik.touched.nationalId && formik.errors.nationalId && (
                               <div className="text-red-500 text-sm mt-1">{formik.errors.nationalId}</div>
                             )}
                        </div>

                        {/* File Uploads */}
                        <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                             <div className={`group relative border-2 border-dashed rounded-xl p-6 text-center hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all cursor-pointer ${
                               formik.touched.nationalSlipImage && formik.errors.nationalSlipImage ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-zinc-700'
                             }`}>
                                 <input 
                                   type="file" 
                                   name="nationalSlipImage" 
                                   onChange={(event) => {
                                     if (event.currentTarget.files) {
                                       formik.setFieldValue("nationalSlipImage", event.currentTarget.files[0]);
                                     }
                                   }}
                                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                   accept="image/*,application/pdf" 
                                 />
                                 <div className="flex flex-col items-center justify-center space-y-2">
                                     <div className="p-3 bg-blue-100 text-blue-600 rounded-full group-hover:scale-110 transition-transform dark:bg-blue-900 dark:text-blue-300">
                                        <Upload className="h-5 w-5" />
                                     </div>
                                     <div className="text-sm font-medium text-gray-900 dark:text-white">National Slip Image</div>
                                     <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[150px] truncate">
                                        {formik.values.nationalSlipImage ? formik.values.nationalSlipImage.name : "Tap to upload"}
                                     </p>
                                     {formik.touched.nationalSlipImage && formik.errors.nationalSlipImage && (
                                       <div className="text-red-500 text-xs mt-1">{formik.errors.nationalSlipImage}</div>
                                     )}
                                 </div>
                             </div>

                             <div className={`group relative border-2 border-dashed rounded-xl p-6 text-center hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all cursor-pointer ${
                               formik.touched.photo && formik.errors.photo ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-zinc-700'
                             }`}>
                                 <input 
                                   type="file" 
                                   name="photo" 
                                   onChange={(event) => {
                                     if (event.currentTarget.files) {
                                       formik.setFieldValue("photo", event.currentTarget.files[0]);
                                     }
                                   }}
                                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                   accept="image/*" 
                                 />
                                 <div className="flex flex-col items-center justify-center space-y-2">
                                     <div className="p-3 bg-blue-100 text-blue-600 rounded-full group-hover:scale-110 transition-transform dark:bg-blue-900 dark:text-blue-300">
                                        <UserPlus className="h-5 w-5" />
                                     </div>
                                     <div className="text-sm font-medium text-gray-900 dark:text-white">Selfie Photo</div>
                                     <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[150px] truncate">
                                        {formik.values.photo ? formik.values.photo.name : "Tap to upload"}
                                     </p>
                                     {formik.touched.photo && formik.errors.photo && (
                                       <div className="text-red-500 text-xs mt-1">{formik.errors.photo}</div>
                                     )}
                                 </div>
                             </div>
                        </div>
                   </div>
                </div>

                {/* Submit Area */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={formik.isSubmitting}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {formik.isSubmitting ? (
                            <>Processing Application...</>
                        ) : (
                            <>
                                Submit Application <CheckCircle className="h-5 w-5" />
                            </>
                        )}
                    </button>
                    <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Protected by reCAPTCHA and subject to the sendMe <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> and <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>.
                    </p>
                </div>

            </form>
          </div>
       </div>
    </div>
  );
}
