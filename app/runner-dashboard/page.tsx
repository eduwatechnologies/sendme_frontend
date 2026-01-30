"use client";

import { useState, useEffect } from "react";
import { Package, MapPin, DollarSign, Clock, CheckCircle, Navigation, ToggleLeft, ToggleRight, Play, CheckSquare, LogOut, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "../../lib/hooks";
import { fetchErrands, updateErrandStatus } from "../../lib/features/errands/errandSlice";
import { logout } from "../../lib/features/auth/authSlice";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";

export default function RunnerDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { errands, isLoading, error } = useAppSelector((state) => state.errands);
  const { unreadCount } = useAppSelector((state) => state.chat);
  
  useEffect(() => {
    dispatch(fetchErrands());
  }, [dispatch]);

  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('available');

  const handleLogout = () => {
    dispatch(logout());
    router.push('/signin');
  };

  const completedErrands = errands.filter(e => e.status === 'Completed');
  const earnings = completedErrands.reduce((acc, curr) => acc + curr.price, 0);

  const stats = [
    { name: 'Today\'s Earnings', value: `₦${earnings.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' },
    { name: 'Completed Jobs', value: completedErrands.length.toString(), icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
    { name: 'Online Hours', value: '5h 20m', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
  ];

  const filteredErrands = errands.filter(errand => {
    if (activeTab === 'available') return errand.status === 'Pending';
    if (activeTab === 'active') {
        const isMyErrand = errand.runner?._id === user?.id || errand.runner === user?.id;
        return (errand.status === 'In Progress' || errand.status === 'Accepted') && isMyErrand;
    }
    if (activeTab === 'completed') {
        const isMyErrand = errand.runner?._id === user?.id || errand.runner === user?.id;
        return errand.status === 'Completed' && isMyErrand;
    }
    return false;
  });

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <ProtectedRoute allowedRoles={['runner']}>
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      {/* Header */}
      <header className="bg-white shadow-sm dark:bg-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
               <Navigation className="h-5 w-5" />
             </div>
             <h1 className="text-xl font-bold text-gray-900 dark:text-white">Runner</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                {isOnline ? 'You are Online' : 'You are Offline'}
              </span>
              <button onClick={() => setIsOnline(!isOnline)}>
                {isOnline ? (
                  <ToggleRight className="h-8 w-8 text-green-600 cursor-pointer" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-gray-400 cursor-pointer" />
                )}
              </button>
            </div>
            <Link href="/chat" className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 relative" title="Messages">
              <MessageSquare className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-900">
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
               <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Profile" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          {stats.map((item) => (
            <div key={item.name} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 dark:bg-zinc-800">
              <div className="flex items-center">
                <div className={`rounded-md p-3 ${item.bg}`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">{item.name}</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{item.value}</dd>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-zinc-700 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {['available', 'active', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium capitalize`}
              >
                {tab} Errands
              </button>
            ))}
          </nav>
        </div>

        {/* Errands List */}
        <div className="space-y-4">
          {filteredErrands.length > 0 ? (
            filteredErrands.map((errand) => (
              <div key={errand._id} className="bg-white shadow rounded-lg p-6 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 hover:border-blue-500 transition-colors cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{errand.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">{errand.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-600">₦{errand.price.toLocaleString()}</span>
                    <p className="text-xs text-gray-400 mt-1">{new Date(errand.createdAt).toLocaleDateString()}</p>
                    {errand.trackingId && (
                      <p className="text-xs font-mono text-gray-500 mt-1 bg-gray-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded inline-block">
                        #{errand.trackingId}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 flex flex-col sm:flex-row gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="font-medium">Pickup:</span> {errand.pickup}
                  </div>
                  <div className="hidden sm:block text-gray-300">|</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="font-medium">Dropoff:</span> {errand.dropoff}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  {errand.status === 'Pending' && (
                    <button 
                      onClick={() => dispatch(updateErrandStatus({ id: errand._id, status: 'Accepted' }))}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="h-4 w-4" /> Request Job
                    </button>
                  )}
                  {errand.status === 'Accepted' && (
                     <div className="flex flex-col gap-2 w-full">
                        <button disabled className="flex-1 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-md text-sm font-semibold cursor-wait flex items-center justify-center gap-2 dark:bg-yellow-900/20 dark:text-yellow-400">
                          <Clock className="h-4 w-4" /> Awaiting User Confirmation
                        </button>
                        {errand.user && (
                        <Link 
                          href={`/chat?userId=${errand.user._id}&userName=${errand.user.name}`} 
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="h-4 w-4" /> Message User
                        </Link>
                      )}
                     </div>
                  )}
                  {errand.status === 'In Progress' && (
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                      <button 
                        onClick={() => dispatch(updateErrandStatus({ id: errand._id, status: 'Completed' }))}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-green-500 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckSquare className="h-4 w-4" /> Mark Completed
                      </button>
                      {errand.user && (
                        <Link 
                          href={`/chat?userId=${errand.user._id}&userName=${errand.user.name}`} 
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="h-4 w-4" /> Message User
                        </Link>
                      )}
                    </div>
                  )}
                  {errand.status === 'Completed' && (
                     <button disabled className="flex-1 bg-gray-100 text-gray-400 px-4 py-2 rounded-md text-sm font-semibold cursor-not-allowed dark:bg-zinc-700 dark:text-gray-500">
                       Completed
                     </button>
                  )}
                  
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-50 dark:border-zinc-600 dark:text-gray-300 dark:hover:bg-zinc-700 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
             <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No errands found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You don't have any {activeTab} errands right now.</p>
             </div>
          )}
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}