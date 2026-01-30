"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";
import { MOCK_RUNNERS } from "@/data/mocks";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ChatScreen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const runner = MOCK_RUNNERS.find((r) => r.id === id);

  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! What do you need me to pick up today?", sender: "runner" },
  ]);
  const [inputText, setInputText] = useState("");

  const formik = useFormik({
    initialValues: {
      itemDetails: "",
    },
    validationSchema: Yup.object({
      itemDetails: Yup.string().required("Please list items to buy"),
    }),
    onSubmit: (values) => {
      // Navigate to payment
      router.push(`/payment/${id}`);
    },
  });

  if (!runner) {
    return <div className="p-4 text-center">Runner not found</div>;
  }

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    setMessages([...messages, { id: Date.now(), text: inputText, sender: "user" }]);
    setInputText("");
    
    // Simulate runner response
    setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now(), text: "Got it! Could you provide more details in the item section?", sender: "runner" }]);
    }, 1000);
  };

  return (
    <ProtectedRoute allowedRoles={['user']}>
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-zinc-900">
      {/* Header */}
      <header className="flex items-center border-b border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <Link href="/dashboard" className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="flex items-center">
          <img
            className="h-10 w-10 rounded-full"
            src={runner.photo}
            alt={runner.name}
          />
          <div className="ml-3">
            <h1 className="text-base font-semibold text-gray-900 dark:text-white">
              {runner.name}
            </h1>
            <span className="text-xs text-green-500">Online</span>
          </div>
        </div>
      </header>

      {/* Main Content: Chat + Item Details */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Area */}
        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-900 shadow dark:bg-zinc-700 dark:text-white"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          
          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-full border-0 bg-gray-100 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 dark:bg-zinc-700 dark:text-white"
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                className="rounded-full bg-blue-600 p-2 text-white hover:bg-blue-500"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Item Details Sidebar (Desktop) */}
        <div className="hidden w-80 border-l border-gray-200 bg-white p-6 md:block dark:border-zinc-700 dark:bg-zinc-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Item Details</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        What to buy?
                    </label>
                    <textarea
                        rows={4}
                        {...formik.getFieldProps('itemDetails')}
                        className={`mt-1 block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-zinc-700 dark:text-white ${
                            formik.touched.itemDetails && formik.errors.itemDetails
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-300 dark:border-zinc-600"
                        }`}
                        placeholder="List items here..."
                    />
                    {formik.touched.itemDetails && formik.errors.itemDetails && (
                        <p className="mt-1 text-sm text-red-600">{formik.errors.itemDetails}</p>
                    )}
                </div>
                <button
                    onClick={() => formik.handleSubmit()}
                    className="w-full flex justify-center items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirm Request
                </button>
            </div>
        </div>
      </div>
      
      {/* Mobile Confirm Button */}
      <div className="md:hidden border-t border-gray-200 bg-gray-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
           <button
                onClick={() => formik.handleSubmit()}
                className="w-full flex justify-center items-center rounded-md bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
            >
                Confirm Request
            </button>
      </div>
    </div>
    </ProtectedRoute>
  );
}
