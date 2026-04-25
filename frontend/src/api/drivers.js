import axios from "axios";

// const API_URL = "http://localhost:5000/api/drivers";
const API_URL = import.meta.env.VITE_API_URL + "api/drivers/";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send cookies for authentication
});

export const getAllDrivers = () => {
  return api.get("/");
};
export const createDriver = (driverData) => {
  return api.post("/", driverData);
};
export const getDriverById = (id) => {
  return api.get(`/${id}`);
};
export const getDriverPerformance = (id) => {
  return api.get(`/${id}/performance`);
};
export const updateDriver = (id, driverData) => {
  return api.put(`/${id}`, driverData);
};
export const assignBins = ({id, bins}) => {
  return api.put("/assign/bins", {driver_id: id, bin_ids: bins});
};
export const deleteDriver = (id) => {
  return api.delete(`/${id}`);
};


