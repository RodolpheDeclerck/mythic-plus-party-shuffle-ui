// SignUp.tsx
import React from 'react';

const SignUp = () => {
    const handleSignUp = () => {
        window.location.href = '/register'; // Redirection vers la page d'inscription
    };

    return (
        <button className="sign-up" onClick={handleSignUp}>Sign Up</button>
    );
};

export default SignUp;
