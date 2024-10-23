// Logout.tsx
import React from 'react';
import Cookies from 'js-cookie';  // Importation de js-cookie

const Logout = () => {
    const handleLogout = () => {
        // Suppression du cookie contenant le token JWT
        Cookies.remove('authToken');  // Suppression du cookie

        // Redirection vers la page d'accueil ou de connexion
        window.location.href = 'http://localhost:3000/';
    };

    return (
        <button className="logout" onClick={handleLogout}>Logout</button>
    );
};

export default Logout;
