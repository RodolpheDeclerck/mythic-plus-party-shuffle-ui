// hooks/useAuthCheck.ts
import { useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import apiUrl from '../config/apiConfig';

const useAuthCheck = () => {
    const authContext = useContext(AuthContext);

    const checkAuth = async () => {
        try {
            const response = await axios.post<{ isAuthenticated: boolean }>(
                `${apiUrl}/auth/verify-token`,
                {},
                { withCredentials: true }
            );
            authContext?.setIsAuthenticated(response.data.isAuthenticated);
        } catch (error) {
            console.error("Erreur lors de la vérification de l'authentification:", error);
            authContext?.setIsAuthenticated(false);
        } finally {
            authContext?.setIsAuthChecked(true);
        }
    };

    // Execute `checkAuth` on mount, if `isAuthChecked` is not defined
    useEffect(() => {
        if (!authContext?.isAuthChecked) {
            checkAuth();
        }
    }, [authContext?.isAuthChecked]);

    return {
        isAuthenticated: authContext?.isAuthenticated,
        isAuthChecked: authContext?.isAuthChecked,
        handleLogout: authContext?.handleLogout,
        checkAuth
    };
};

export default useAuthCheck;
