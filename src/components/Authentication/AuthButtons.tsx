// AuthButtons.tsx
import React, { useEffect, useState } from 'react';
import SignIn from './SignIn';
import SignUp from './SignUp';
import Logout from './Logout';
import DashBoardButton from './DashBoardButton';
import Cookies from 'js-cookie';  // Importation de js-cookie


const AuthButtons = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Vérifier l'authentification en regardant le cookie JWT
    useEffect(() => {
        const token = Cookies.get('authToken');  // Vérifie si le cookie JWT est présent
        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, []);

    return (
        <div>
            <div className="auth-buttons">
                {isAuthenticated ? (
                    <>
                        <DashBoardButton />
                        <Logout />
                    </>
                ) : (
                    <>
                        <SignIn />
                        <SignUp />
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthButtons;
