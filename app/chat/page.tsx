"use client";

import { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../lib/hooks";
import { fetchConversations, fetchMessages, sendMessage, setActiveConversationUser, addMessage, resetUnreadCount } from "../../lib/features/chat/chatSlice";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Send, User as UserIcon, MoreVertical, Phone, Video, Search, ArrowLeft, CreditCard } from "lucide-react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { clearActiveErrandRequest, fetchErrandsBetweenUsers, updateErrandStatus } from "@/lib/features/errands/errandSlice";
// Socket is handled globally in NotificationProvider

export default function ChatPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);
  const { conversations, activeConversationMessages, activeConversationUser, isLoading, isSending } = useAppSelector((state) => state.chat);
  const { activeErrandRequest } = useAppSelector((state) => state.errands);
  
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Initial load
  useEffect(() => {
    dispatch(fetchConversations());
    dispatch(resetUnreadCount());
  }, [dispatch]);

  // Check URL params for starting a new chat
  useEffect(() => {
    const userId = searchParams.get('userId');
    const userName = searchParams.get('userName');
    
    if (userId && userName) {
      dispatch(setActiveConversationUser({ _id: userId, name: userName }));
      dispatch(fetchMessages(userId));
      setMobileShowChat(true);
      // Clear unread count when entering chat? 
      // Ideally we should have an API to mark as read.
      // For now we just reset the count locally if needed, but it's global count.
      // Let's assume opening any chat clears the "badge" for simplicity or 
      // we need a smarter way to decrement. 
      // dispatch(clearUnreadCount()); // Optional: uncomment if you want to clear global badge on any chat open
    }
  }, [searchParams, dispatch]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversationMessages]);

  const handleSelectConversation = (conversationUser: any) => {
    dispatch(setActiveConversationUser(conversationUser));
    dispatch(fetchMessages(conversationUser._id));
    dispatch(fetchErrandsBetweenUsers(conversationUser._id));
    setMobileShowChat(true);
  };

  const handleConfirmRunner = async () => {
    if (!activeErrandRequest) return;
    // In a real app, this would trigger Stripe/Payment Gateway
    // For now, we simulate payment confirmation
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
      if (!activeErrandRequest) return;
      
      await dispatch(updateErrandStatus({ 
          id: activeErrandRequest._id, 
          status: 'In Progress' 
      }));
      setShowPaymentModal(false);
      // Send a system message or notification could go here
      await dispatch(sendMessage({
        recipientId: activeConversationUser?._id as any,
        content: "I have confirmed your request. You can start the errand now!"
      }));
  };

  const handleRejectRunner = async () => {
    if (!activeErrandRequest) return;
    
    if (confirm("Are you sure you want to reject this runner?")) {
        await dispatch(updateErrandStatus({ 
            id: activeErrandRequest._id, 
            status: 'Pending' 
        }));
        dispatch(clearActiveErrandRequest());
        
        await dispatch(sendMessage({
            recipientId: activeConversationUser?._id as any,
            content: "I have rejected your request."
        }));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversationUser) return;

    await dispatch(sendMessage({
      recipientId: activeConversationUser._id,
      content: messageInput
    }));
    
    setMessageInput("");
  };

  const handleBackToList = () => {
    setMobileShowChat(false);
    dispatch(setActiveConversationUser(null));
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 dark:bg-zinc-900 overflow-hidden">
        {/* Sidebar / Conversation List */}
        <div className={`w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700 flex flex-col ${mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-zinc-700 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Messages</h1>
            <Link href={user?.role === 'runner' ? '/runner-dashboard' : '/dashboard'} className="text-sm text-blue-600 hover:underline">
              Exit
            </Link>
          </div>

          {/* Search (Visual only for now) */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-zinc-700 border-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <p>No conversations yet.</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div 
                  key={conv.user._id}
                  onClick={() => handleSelectConversation(conv.user)}
                  className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors ${activeConversationUser?._id === conv.user._id ? 'bg-blue-50 dark:bg-zinc-700 border-l-4 border-blue-600' : ''}`}
                >
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {conv.user.photo ? (
                        <img src={conv.user.photo} alt={conv.user.name} className="h-full w-full object-cover" />
                      ) : (
                        <UserIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    {/* Online status indicator could go here */}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{conv.user.name}</h3>
                      <span className="text-xs text-gray-500">{new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex-1">
                        {conv.lastMessage.sender._id === user?.id ? 'You: ' : ''}{conv.lastMessage.content}
                      </p>
                      {/* Unread badge placeholder - Logic needs to be in backend/redux to track unread per conversation */}
                      {/* For now, we can check if the last message is NOT from us and we haven't opened this chat */}
                      {conv.lastMessage.sender._id !== user?.id && activeConversationUser?._id !== conv.user._id && (
                        <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white">
                          1
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col h-full ${!mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
          {activeConversationUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={handleBackToList} className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                     {activeConversationUser.photo ? (
                        <img src={activeConversationUser.photo} alt={activeConversationUser.name} className="h-full w-full object-cover" />
                      ) : (
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      )}
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white">{activeConversationUser.name}</h2>
                    <p className="text-xs text-green-500">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-full">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-full">
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-full">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Request Banner */}
              {activeErrandRequest && activeErrandRequest.status === 'Accepted' && user?.role === 'user' && (
                  <div className="bg-white dark:bg-zinc-800 p-4 border-b border-blue-100 dark:border-blue-900 shadow-sm z-10">
                      <div className="flex justify-between items-start">
                          <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                Job Request: {activeErrandRequest.title}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  Runner <strong>{activeConversationUser.name}</strong> wants to accept this errand for <span className="text-green-600 font-bold">₦{activeErrandRequest.price.toLocaleString()}</span>.
                              </p>
                          </div>
                          <div className="flex gap-2">
                              <button 
                                  onClick={handleRejectRunner}
                                  className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
                              >
                                  Reject
                              </button>
                              <button 
                                  onClick={handleConfirmRunner}
                                  className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1 transition-colors"
                              >
                                  Confirm & Pay
                              </button>
                          </div>
                      </div>
                  </div>
              )}
              
              {/* In Progress Banner */}
              {activeErrandRequest && activeErrandRequest.status === 'In Progress' && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 border-b border-green-100 dark:border-green-900 flex justify-between items-center px-6">
                      <span className="text-sm text-green-700 dark:text-green-300 font-medium flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          Errand "{activeErrandRequest.title}" is in progress
                      </span>
                  </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-zinc-900 space-y-4">
                {isLoading && activeConversationMessages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  activeConversationMessages.map((msg, index) => {
                    const isMe = msg.sender?._id === user?.id;
                    return (
                      <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          isMe 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-700 rounded-bl-none'
                        }`}>
                          <p>{msg.content}</p>
                          <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-700">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 dark:bg-zinc-700 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button 
                    type="submit" 
                    disabled={!messageInput.trim() || isSending}
                    className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50 dark:bg-zinc-900">
              <div className="h-24 w-24 bg-gray-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                <Send className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your Messages</h3>
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
      {/* Payment Simulation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-xl transform transition-all">
                <div className="text-center mb-6">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                        <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Secure Payment</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        You are about to pay <span className="font-bold text-gray-900 dark:text-white">₦{activeErrandRequest?.price.toLocaleString()}</span> for errand "{activeErrandRequest?.title}".
                    </p>
                </div>
                
                <div className="space-y-3 mb-6">
                    <div className="p-3 border border-gray-200 dark:border-zinc-700 rounded-lg flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full border-2 border-blue-600 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Wallet Balance (₦50,000.00)</span>
                    </div>
                    <div className="p-3 border border-gray-200 dark:border-zinc-700 rounded-lg flex items-center gap-3 opacity-50">
                         <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Credit/Debit Card</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowPaymentModal(false)}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg dark:bg-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-600"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={processPayment}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm"
                    >
                        Confirm Payment
                    </button>
                </div>
            </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
