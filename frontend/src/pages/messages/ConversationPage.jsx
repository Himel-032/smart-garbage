import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { getMessages, sendMessage as sendMessageAPI, markMessagesAsRead } from "../../api/messages.js";
import { getDriverById } from "../../api/drivers.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useSocket } from "../../context/SocketContext.jsx";
import MessageList from "../../components/messages/MessageList.jsx";
import MessageInput from "../../components/messages/MessageInput.jsx";
import { ArrowLeft, User, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const ConversationPage = () => {
  const { driverId } = useParams();
  const navigate = useNavigate();
  const { admin } = useAuth();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const pollingIntervalRef = useRef(null);
  const [lastMessageCount, setLastMessageCount] = useState(0);

  useEffect(() => {
    if (admin) {
      fetchDriver();
      fetchMessages(true);
      markAsRead();
      
      // Join socket room for this conversation
      if (socket && isConnected) {
        const room = `admin_${admin.id}-driver_${driverId}`;
        socket.emit("joinRoom", room);
        
        // Listen for new messages
        socket.on("newMessage", (message) => {
          setMessages((prev) => [...prev, message]);
          markAsRead();
        });
      }
      
      // Fallback polling every 10 seconds (less frequent since we have sockets)
      pollingIntervalRef.current = setInterval(() => {
        fetchMessages(false);
      }, 10000);
      
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        if (socket) {
          socket.off("newMessage");
        }
      };
    }
  }, [driverId, admin, socket, isConnected]);

  const markAsRead = async () => {
    try {
      await markMessagesAsRead(driverId);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const fetchDriver = async () => {
    try {
      const response = await getDriverById(driverId);
      setDriver(response.data);
    } catch (error) {
      console.error("Error fetching driver:", error);
      toast.error("Failed to fetch driver details");
    }
  };

  const fetchMessages = async (showLoading = true) => {
    if (!admin) return;
    
    try {
      if (showLoading) setLoading(true);
      const response = await getMessages(admin.id, driverId);
      const newMessages = response.data.data;
      
      // Check if there are new messages
      if (!showLoading && newMessages.length > lastMessageCount) {
        // Mark as read when new messages arrive
        markAsRead();
      }
      
      setMessages(newMessages);
      setLastMessageCount(newMessages.length);
    } catch (error) {
      console.error("Error fetching messages:", error);
      if (showLoading) {
        toast.error("Failed to fetch messages");
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;

    try {
      setSending(true);
      
      // Send via Socket.IO if connected, otherwise use REST API
      if (socket && isConnected) {
        socket.emit("sendMessage", {
          receiver_role: "driver",
          receiver_id: parseInt(driverId),
          content: messageContent,
        });
        setMessageContent("");
        toast.success("Message sent");
      } else {
        await sendMessageAPI(driverId, messageContent);
        setMessageContent("");
        // Immediately fetch messages after sending
        await fetchMessages(false);
        toast.success("Message sent");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate("/messages")}
            className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3 flex-1">
            {driver ? (
              <>
                {driver.photo_url ? (
                  <img
                    src={driver.photo_url}
                    alt={driver.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <User size={24} className="text-gray-600" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {driver.name}
                  </h1>
                  <p className="text-sm text-gray-600">{driver.email}</p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                <span className="text-gray-600">Loading...</span>
              </div>
            )}
          </div>
        </div>

        {/* Chat Container */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col" style={{ height: "calc(100vh - 250px)" }}>
          <MessageList messages={messages} loading={loading} />
          <MessageInput
            value={messageContent}
            onChange={setMessageContent}
            onSend={handleSendMessage}
            disabled={sending}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ConversationPage;
