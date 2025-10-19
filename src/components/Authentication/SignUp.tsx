// SignUp.tsx
import React from 'react';

const SignUp = () => {
    const handleSignUp = () => {
        window.location.href = '/register'; // Redirect to registration page
    };

    return (
        <button className="sign-up" onClick={handleSignUp}>Sign Up</button>
    );
};

export default SignUp;
