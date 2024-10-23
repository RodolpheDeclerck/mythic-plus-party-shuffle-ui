import React from 'react';
import { useLocation } from 'react-router-dom';

const SignIn = () => {
    const location = useLocation();

    const handleSignIn = () => {
        // Stocke l'URL complète (path + search) dans le localStorage avant de rediriger vers la page de connexion
        const redirectUrl = location.pathname + location.search;
        localStorage.setItem('redirectAfterLogin', redirectUrl);
        window.location.href = 'http://localhost:3000/login'; // Redirection vers la page de connexion
    };

    return (
        <button className="sign-in" onClick={handleSignIn}>Sign In</button>
    );
};

export default SignIn;
