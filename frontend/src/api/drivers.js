import axios from "axios";

const API_URL = "http://localhost:5000/api/drivers";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send cookies for authentication
});

export const getAllDrivers = () => {
  return api.get("/");
};


