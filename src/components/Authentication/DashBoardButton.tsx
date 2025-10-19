// SignUp.tsx
import React from 'react';

const DashBoardButton = () => {
    const handleSignUp = () => {
        window.location.href = '/dashboard'; // Redirect to dashboard page
    };

    return (
        <button className="dashboard" onClick={handleSignUp}>DashBoard</button>
    );
};

export default DashBoardButton;
