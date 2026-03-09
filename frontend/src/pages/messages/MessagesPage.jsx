import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { getConversations } from "../../api/messages.js";
import ConversationItem from "../../components/messages/ConversationItem.jsx";
import ComposeModal from "../../components/messages/ComposeModal.jsx";
import { MessageCircle, Loader2, Search, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";

const MessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    fetchConversations(true);
    
    // Poll for new conversations/messages every 5 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchConversations(false);
    }, 5000);
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const fetchConversations = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await getConversations();
      setConversations(response.data.data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      if (showLoading) {
        toast.error("Failed to fetch conversations");
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MessageCircle size={32} className="text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            </div>
            <button
              onClick={() => setIsComposeOpen(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <PlusCircle size={20} />
              Compose
            </button>
          </div>
          <p className="text-gray-600">
            View and manage conversations with drivers
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="py-12 text-center">
              <MessageCircle
                size={48}
                className="mx-auto mb-4 text-gray-400"
              />
              <p className="text-gray-600">
                {searchTerm
                  ? "No conversations found"
                  : "No conversations yet"}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Conversations will appear here when drivers send messages
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />
    </DashboardLayout>
  );
};

export default MessagesPage;
