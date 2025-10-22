import React from 'react';
import './HomeButton.css';  // Import specific style for Home button

const HomeButton = () => {
    const handleHome = () => {
        window.location.href = '/'; // Redirect to home page
    };

    return (
        <button className="home-button" onClick={handleHome}>Home</button>
    );
};

export default HomeButton;
