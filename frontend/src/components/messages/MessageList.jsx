import React, { useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

const MessageList = ({ messages, loading }) => {
  const { admin } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No messages yet</p>
          <p className="text-sm">Start a conversation by sending a message</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isAdmin = message.sender_role === "admin";
        const isOwn = isAdmin;

        return (
          <div
            key={message.id}
            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                isOwn
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
              <p
                className={`mt-1 text-xs ${
                  isOwn ? "text-green-100" : "text-gray-500"
                }`}
              >
                {new Date(message.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
