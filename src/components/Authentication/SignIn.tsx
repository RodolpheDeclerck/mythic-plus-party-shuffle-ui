import React from 'react';
import { useLocation } from 'react-router-dom';

const SignIn = () => {
    const location = useLocation();

    const handleSignIn = () => {
        // Store complete URL (path + search) in localStorage before redirecting to login page
        const redirectUrl = location.pathname + location.search;
        localStorage.setItem('redirectAfterLogin', redirectUrl);
        window.location.href = '/login'; // Redirect to login page
    };

    return (
        <button className="sign-in" onClick={handleSignIn}>Sign In</button>
    );
};

export default SignIn;
