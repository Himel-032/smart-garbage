import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "api/messages/";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Search drivers to compose message
export const searchDrivers = (searchTerm = "") => {
  return api.get("/search-drivers", {
    params: { search: searchTerm },
  });
};

// Get all conversations (list of drivers)
export const getConversations = () => {
  return api.get("/conversations");
};

// Get messages between admin and a specific driver
export const getMessages = (adminId, driverId) => {
  return api.get("/admin", {
    params: {
      user_role: "admin",
      user_id: adminId,
      other_role: "driver",
      other_id: driverId,
    },
  });
};

// Send a message to a driver
export const sendMessage = (driverId, content) => {
  return api.post("/admin", {
    receiver_role: "driver",
    receiver_id: driverId,
    content,
  });
};

// Mark messages as read
export const markMessagesAsRead = (driverId) => {
  return api.put("/mark-read", {
    driver_id: driverId,
  });
};
