import React from 'react';
import './HomeButton.css';  // Importe le style spécifique pour le bouton Home

const HomeButton = () => {
    const handleHome = () => {
        window.location.href = '/'; // Redirection vers la page d'accueil
    };

    return (
        <button className="home-button" onClick={handleHome}>Home</button>
    );
};

export default HomeButton;
