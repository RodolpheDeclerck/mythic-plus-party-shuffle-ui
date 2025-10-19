import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import apiUrl from '../config/apiConfig';

// AuthContextType definition with isAuthChecked
interface AuthContextType {
    isAuthenticated: boolean | null;
    isAuthChecked: boolean;
    setIsAuthenticated: (value: boolean) => void;
    setIsAuthChecked: (value: boolean) => void; // Add setIsAuthChecked here
    handleLogout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isAuthChecked, setIsAuthChecked] = useState(false); // Declare setIsAuthChecked

    const checkAuth = async () => {
        try {
            const response = await axios.post<{ isAuthenticated: boolean }>(
                `${apiUrl}/auth/verify-token`,
                {},
                { withCredentials: true }
            );
            setIsAuthenticated(response.data.isAuthenticated);
        } catch (error) {
            console.error('Error checking authentication', error);
            setIsAuthenticated(false);
        } finally {
            setIsAuthChecked(true); // Utilisation de setIsAuthChecked
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post(`${apiUrl}/auth/logout`, {}, { withCredentials: true });
            localStorage.removeItem('session');
            setIsAuthenticated(false);
            setIsAuthChecked(false);
            window.location.href = '/login';
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    };

    useEffect(() => {
        if (!isAuthChecked) {
            checkAuth();
        }
    }, [isAuthChecked]);

    if (!isAuthChecked) {
        return <div className="wrapper">Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, isAuthChecked, setIsAuthenticated, setIsAuthChecked, handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
};