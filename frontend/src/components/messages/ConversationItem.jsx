import React from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, User } from "lucide-react";

const ConversationItem = ({ conversation }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/messages/${conversation.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-4 border-b border-gray-200 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="flex-shrink-0 relative">
        {conversation.photo_url ? (
          <img
            src={conversation.photo_url}
            alt={conversation.name}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
            <User size={24} className="text-gray-600" />
          </div>
        )}
        {conversation.unread_count > 0 && (
          <div className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 truncate">
            {conversation.name}
          </h3>
          {conversation.last_message_time && (
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {new Date(conversation.last_message_time).toLocaleDateString()}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 truncate">
          {conversation.last_message || "No messages yet"}
        </p>
      </div>
      <MessageCircle size={20} className="text-gray-400 flex-shrink-0" />
    </div>
  );
};

export default ConversationItem;
