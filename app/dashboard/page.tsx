"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, MapPin, Star, List, Map as MapIcon, Plus, Clock, CreditCard, Bell, Filter, User, X, LogOut, MessageSquare } from "lucide-react";
import dynamic from "next/dynamic";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../lib/hooks";
import { fetchErrands, createErrand } from "../../lib/features/errands/errandSlice";
import { logout } from "../../lib/features/auth/authSlice";
import { MOCK_RUNNERS } from "../../data/mocks";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";

// Dynamically import Map component to disable SSR for Leaflet
const Map = dynamic(() => import("@/components/Map"), { 
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-zinc-800 rounded-lg">
            <p className="text-gray-500">Loading Map...</p>
        </div>
    )
});

export default function Dashboard() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Use Redux
  const dispatch = useAppDispatch();
  const { errands, isLoading } = useAppSelector((state) => state.errands);
  const { user } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.chat);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/signin');
  };

  useEffect(() => {
    dispatch(fetchErrands());
  }, [dispatch]);
  
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      pickup: '',
      dropoff: '',
      price: ''
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      description: Yup.string().required("Description is required"),
      pickup: Yup.string().required("Pickup location is required"),
      dropoff: Yup.string().required("Dropoff location is required"),
      price: Yup.number().required("Price is required").positive("Price must be positive").min(100, "Minimum price is ₦100"),
    }),
    onSubmit: async (values, { resetForm }) => {
      await dispatch(createErrand({
        title: values.title,
        description: values.description,
        pickup: values.pickup,
        dropoff: values.dropoff,
        price: Number(values.price)
      }));
      setIsModalOpen(false);
      resetForm();
    },
  });

  // Calculate stats from errands
  const activeErrands = errands.filter(e => e.status === 'In Progress' || e.status === 'Pending' || e.status === 'Accepted');
  const completedErrands = errands.filter(e => e.status === 'Completed');
  
  const activeErrandsCount = activeErrands.length;
  const totalSpent = completedErrands.reduce((acc, curr) => acc + curr.price, 0) + 
                   activeErrands.reduce((acc, curr) => acc + curr.price, 0);
  
  const currentActiveErrand = activeErrands.find(e => e.status === 'In Progress' || e.status === 'Accepted') || activeErrands[0] || null;
  const savedPlacesCount = 4; // Mock for now



  return (
    <ProtectedRoute allowedRoles={['user']}>
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 font-sans">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 dark:bg-zinc-900 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
               <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                 <MapPin className="h-5 w-5" />
               </div>
               <span className="text-xl font-bold text-gray-900 dark:text-white">sendMe</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/chat" className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 relative" title="Messages">
                <MessageSquare className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-900">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                title="Logout"
              >
                <LogOut className="h-6 w-6" />
              </button>
              <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                {user?.photo ? (
                  <img src={user.photo} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {user?.name?.[0] || 'U'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Good Morning, {user?.name || 'User'}! 👋</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Ready to send your next errand?</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Errand
          </button>
        </div>

        {/* Stats / Active Status */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
           <div className="bg-white dark:bg-zinc-800 overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm p-5 flex items-start justify-between">
              <div>
                 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Errands</p>
                 <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{activeErrandsCount}</p>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                 <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
           </div>
           <div className="bg-white dark:bg-zinc-800 overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm p-5 flex items-start justify-between">
              <div>
                 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spent</p>
                 <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">₦{totalSpent.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                 <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
           </div>
           <div className="bg-white dark:bg-zinc-800 overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm p-5 flex items-start justify-between">
              <div>
                 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Saved Places</p>
                 <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{savedPlacesCount}</p>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                 <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
           </div>
        </div>

        {/* Active Errand Banner */}
        {currentActiveErrand && (
          <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <MapIcon className="h-32 w-32" />
             </div>
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                   <span className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                      <Clock className="h-4 w-4" />
                      {currentActiveErrand.status}
                   </span>
                   <span className="text-sm opacity-80">{new Date(currentActiveErrand.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                   <h2 className="text-2xl font-bold">{currentActiveErrand.title}</h2>
                   {currentActiveErrand.trackingId && (
                     <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white/80 font-mono">
                       #{currentActiveErrand.trackingId}
                     </span>
                   )}
                </div>
                <p className="text-blue-100 mb-6 max-w-xl">{currentActiveErrand.description}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                   <div className="flex items-start gap-3">
                      <div className="mt-1 bg-white/20 p-1.5 rounded-full">
                         <div className="h-2 w-2 bg-white rounded-full"></div>
                      </div>
                      <div>
                         <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Pickup</p>
                         <p className="font-medium">{currentActiveErrand.pickup}</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3">
                      <div className="mt-1 bg-white/20 p-1.5 rounded-full">
                         <MapPin className="h-3 w-3" />
                      </div>
                      <div>
                         <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Dropoff</p>
                         <p className="font-medium">{currentActiveErrand.dropoff}</p>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-4">
                   <Link href={`/tracking/${currentActiveErrand._id}`} className="bg-white text-blue-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-sm">
                      Track Order
                   </Link>
                   {currentActiveErrand.runner ? (
                     <Link href={`/chat?userId=${currentActiveErrand.runner._id}&userName=${currentActiveErrand.runner.name}`} className="bg-blue-800/50 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-800 transition-colors border border-blue-500/30">
                        Message Runner
                     </Link>
                   ) : (
                     <span className="bg-gray-500/50 text-white px-5 py-2.5 rounded-lg font-semibold cursor-not-allowed border border-gray-500/30">
                        Waiting for Runner...
                     </span>
                   )}
                </div>
             </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             {/* Search */}
             <div className="relative flex-1 max-w-lg">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-lg border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-zinc-900 dark:ring-zinc-700 dark:text-white"
                  placeholder="Search for runners or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>

             {/* View Toggle */}
             <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-900 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                  }`}
                >
                  <List className="h-4 w-4" />
                  List
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'map' 
                      ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                  }`}
                >
                  <MapIcon className="h-4 w-4" />
                  Map
                </button>
             </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 bg-gray-50/50 dark:bg-zinc-900/50 min-h-[500px]">
            {viewMode === 'list' ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {MOCK_RUNNERS.map((runner) => (
                  <div
                    key={runner.id}
                    className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md border border-gray-200 dark:bg-zinc-800 dark:border-zinc-700"
                  >
                    <div className="p-6 flex-1">
                       <div className="flex items-start justify-between">
                          <div className="relative">
                             <img
                               src={runner.photo}
                               alt={runner.name}
                               className="h-14 w-14 rounded-full object-cover ring-2 ring-white dark:ring-zinc-700"
                             />
                             <span className={`absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-zinc-800 ${
                               runner.availability === 'Available' ? 'bg-green-400' : 'bg-gray-300'
                             }`} />
                          </div>
                          <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                             <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                             <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">{runner.rating}</span>
                          </div>
                       </div>
                       
                       <div className="mt-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                             {runner.name}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                             <MapPin className="mr-1 h-3.5 w-3.5" />
                             {runner.location} • {runner.distance}
                          </div>
                       </div>

                       <div className="mt-4 flex flex-wrap gap-2">
                          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-zinc-700 dark:text-gray-300">
                            Grocery
                          </span>
                          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-zinc-700 dark:text-gray-300">
                            Documents
                          </span>
                       </div>
                    </div>

                    <div className="flex border-t border-gray-100 dark:border-zinc-700 divide-x divide-gray-100 dark:divide-zinc-700">
                       <Link
                         href={`/chat/${runner.id}`}
                         className="flex-1 py-3 text-sm font-medium text-center text-gray-600 hover:bg-gray-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-zinc-700 dark:hover:text-white transition-colors"
                       >
                         Chat
                       </Link>
                       <Link
                         href={`/runner/${runner.id}`}
                         className="flex-1 py-3 text-sm font-medium text-center text-gray-600 hover:bg-gray-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-zinc-700 dark:hover:text-white transition-colors"
                       >
                         View Profile
                       </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[600px] w-full rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 shadow-inner">
                 <Map runners={MOCK_RUNNERS} />
              </div>
            )}
          </div>
        </div>
      {/* New Errand Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Errand</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Buy Groceries"
                  {...formik.getFieldProps('title')}
                  className={`w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white ${
                    formik.touched.title && formik.errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formik.touched.title && formik.errors.title && (
                  <div className="text-red-500 text-xs mt-1">{formik.errors.title}</div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea 
                  placeholder="Details about what you need..."
                  rows={3}
                  {...formik.getFieldProps('description')}
                  className={`w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white ${
                    formik.touched.description && formik.errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formik.touched.description && formik.errors.description && (
                  <div className="text-red-500 text-xs mt-1">{formik.errors.description}</div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pickup</label>
                  <input 
                    type="text" 
                    placeholder="Where from?"
                    {...formik.getFieldProps('pickup')}
                    className={`w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white ${
                      formik.touched.pickup && formik.errors.pickup ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formik.touched.pickup && formik.errors.pickup && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.pickup}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dropoff</label>
                  <input 
                    type="text" 
                    placeholder="Where to?"
                    {...formik.getFieldProps('dropoff')}
                    className={`w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white ${
                      formik.touched.dropoff && formik.errors.dropoff ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formik.touched.dropoff && formik.errors.dropoff && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.dropoff}</div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price Offer (₦)</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <span className="text-gray-500 sm:text-sm">₦</span>
                   </div>
                   <input 
                    type="number" 
                    placeholder="2000"
                    {...formik.getFieldProps('price')}
                    className={`w-full rounded-lg border pl-8 pr-4 py-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white ${
                      formik.touched.price && formik.errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {formik.touched.price && formik.errors.price && (
                  <div className="text-red-500 text-xs mt-1">{formik.errors.price}</div>
                )}
              </div>

              <button 
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {formik.isSubmitting ? 'Posting...' : 'Post Errand'}
              </button>
            </form>
          </div>
        </div>
      )}
      </main>
    </div>
    </ProtectedRoute>
  );
}