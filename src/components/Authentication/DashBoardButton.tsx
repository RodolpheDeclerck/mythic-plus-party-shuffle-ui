// SignUp.tsx
import React from 'react';

const DashBoardButton = () => {
    const handleSignUp = () => {
        window.location.href = 'http://localhost:3000/dashboard'; // Redirection vers la page d'inscription
    };

    return (
        <button className="dashboard" onClick={handleSignUp}>DashBoard</button>
    );
};

export default DashBoardButton;
