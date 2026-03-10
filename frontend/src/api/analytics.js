import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "api/analytics/";

/**
 * Get analytics for a single bin
 * @param {number} binId - The bin ID
 * @param {string} range - 'daily' | 'weekly' | 'monthly'
 */
export const getBinAnalytics = async (binId, range = 'daily') => {
  try {
    const response = await axios.get(`${API_URL}bin/${binId}`, {
      params: { range },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get analytics for all bins combined
 * @param {string} range - 'daily' | 'weekly' | 'monthly'
 */
export const getAllBinsAnalytics = async (range = 'daily') => {
  try {
    const response = await axios.get(`${API_URL}bins`, {
      params: { range },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get top N bins by average fill level
 * @param {number} top - Number of top bins to fetch (default 5)
 */
export const getTopBinsAnalytics = async (top = 5) => {
  try {
    const response = await axios.get(`${API_URL}top`, {
      params: { top },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
