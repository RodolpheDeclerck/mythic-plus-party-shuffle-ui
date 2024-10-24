// SignUp.tsx
import React from 'react';

const DashBoardButton = () => {
    const handleSignUp = () => {
        window.location.href = '/dashboard'; // Redirection vers la page d'inscription
    };

    return (
        <button className="dashboard" onClick={handleSignUp}>DashBoard</button>
    );
};

export default DashBoardButton;
