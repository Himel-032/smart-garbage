import axios from "axios";

const API_URL = "http://localhost:5000/api/bins";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send cookies for authentication
});

export const getAllBins = () => {
  return api.get("/");
};

export const getBinById = (id) => {
  return api.get(`/${id}`);
};

export const addBin = (binData) => {
  return api.post("/add", binData);
};

export const updateBin = (id, binData) => {
  return api.put(`/${id}`, binData);
};

export const deleteBin = (id) => {
  return api.delete(`/${id}`);
};
