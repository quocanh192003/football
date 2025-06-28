import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { jwtDecode } from 'jwt-decode'; // You might need to install jwt-decode: npm install jwt-decode

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                // Check if token is expired
                if (decodedToken.exp * 1000 > Date.now()) {
                    setUser({ 
                        id: decodedToken.sub, 
                        name: decodedToken.name, 
                        role: decodedToken.role,
                        unique_name: decodedToken.unique_name,
                        nameid: decodedToken.nameid
                    });
                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                } else {
                    // Token is expired
                    logout();
                }
            } catch (error) {
                console.error("Invalid token");
                logout();
            }
        } 
    }, [token]);

    const login = async (username, password) => {
        try {
            const response = await axiosInstance.post('/api/Auth/login', { username, password });
            if (response.data.isSuccess) {
                const { token, user: userInfo } = response.data.result;
                localStorage.setItem('token', token);
                setToken(token);
                setUser(userInfo);
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                return { success: true, user: userInfo };
            }
            return { success: false, error: response.data.errorMessages.join(', ') };
        } catch (error) {
            const errorMessage = error.response?.data?.errorMessages?.join(', ') || 'Login failed. Please try again.';
            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        delete axiosInstance.defaults.headers.common['Authorization'];
    };

    const register = async (userData) => {
        // Map frontend field names to backend API field names
        const apiData = {
            username: userData.username,
            email: userData.email,
            password: userData.password,
            hoTen: userData.fullName,
            soDienThoai: userData.phoneNumber,
            // diachi: userData.address,
            tenVaiTro: userData.role,
            ngaySinh: userData.ngaysinh,
            gioiTinh: userData.gioiTinh
        };
        try {
            const response = await axiosInstance.post('/api/Auth/Register', apiData);
            if (response.data.isSuccess) {
                return { success: true };
            }
            return { success: false, error: response.data.errorMessages.join(', ') };
        } catch (error) {
            const errorMessage = error.response?.data?.errorMessages?.join(', ') || 'Registration failed. Please try again.';
            return { success: false, error: errorMessage };
        }
    };

    const verifyEmail = async (email, code) => {
        try {
            const response = await axiosInstance.post('/api/Auth/email-verification', { email, code });
            if (response.data.isSuccess) {
                return { success: true };
            }
            return { success: false, error: response.data.errorMessages.join(', ') };
        } catch (error) {
            const errorMessage = error.response?.data?.errorMessages?.join(', ') || 'Email verification failed. Please try again.';
            return { success: false, error: errorMessage };
        }
    };

    const authContextValue = {
        user,
        token,
        login,
        logout,
        register,
        verifyEmail,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
