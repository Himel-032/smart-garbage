
import { createContext,useContext, useState, useEffect } from 'react';
import { login, logout, getMe, updateProfile } from '../api/auth.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    // check logged in admin on mount
    useEffect(() => {
        const fetchMe = async () => {
            try {
                const { data } = await getMe();
                setAdmin(data.admin);
            } catch {
                setAdmin(null);
            } finally {
                setLoading(false);
            }
        };
        fetchMe();
    }, []);

    const loginAdmin = async (email, password) => {
        const { data } = await login(email, password);
        setAdmin(data.admin);
    };
    const logoutAdmin = async () => {
        await logout();
        setAdmin(null);
    };
    const updateAdminProfile = async (profileData) => {
        const { data } = await updateProfile(profileData);
        setAdmin(data.admin);
        return data.admin;
    };
    return (
        <AuthContext.Provider value={{ admin, loading, loginAdmin, logoutAdmin, updateAdminProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => {
    return useContext(AuthContext);
};