"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { addMessage, fetchConversations } from "../lib/features/chat/chatSlice";
import { io, Socket } from "socket.io-client";
import { Toaster, toast } from "react-hot-toast";
import { MessageSquare } from "lucide-react";

interface NotificationContextType {
  socket: Socket | null;
}

const NotificationContext = createContext<NotificationContextType>({ socket: null });

export const useNotification = () => useContext(NotificationContext);

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const userId = user?.id || (user as any)?._id;

    if (userId) {
      // Connect to socket
      socketRef.current = io("http://localhost:5000");
      
      socketRef.current.on("connect", () => {
        console.log("Notification Socket connected:", socketRef.current?.id);
        socketRef.current?.emit("join", userId);
      });

      socketRef.current.on("newMessage", (message) => {
        console.log("New message received:", message);
        
        // Dispatch to Redux store
        dispatch(addMessage(message));
        dispatch(fetchConversations());

        // Show Toast Notification
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-sm w-full bg-white dark:bg-zinc-800 shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden border border-gray-100 dark:border-zinc-700`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5 relative">
                   {message.sender?.photo ? (
                     <img
                       className="h-10 w-10 rounded-full object-cover border-2 border-white dark:border-zinc-700 shadow-sm"
                       src={message.sender.photo}
                       alt=""
                     />
                   ) : (
                     <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm text-white">
                       <MessageSquare className="h-5 w-5" />
                     </div>
                   )}
                   <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white dark:ring-zinc-800" />
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-baseline">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {message.sender?.name || 'Unknown User'}
                    </p>
                    <span className="text-xs text-gray-400">now</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {message.content}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200 dark:border-zinc-700">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        ), {
          duration: 4000,
          position: 'top-right',
        });
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [user, dispatch]);

  return (
    <NotificationContext.Provider value={{ socket: socketRef.current }}>
      {children}
      <Toaster position="top-right" />
    </NotificationContext.Provider>
  );
}
