
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // send cookies
});
export const login = (email, password) => {
    return api.post('login', { email, password });
}
export const logout = () => {
    return api.post('logout');
}
export const getMe = () => {
    return api.get('me');
}