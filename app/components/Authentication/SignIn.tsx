'use client';

import React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const SignIn = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleSignIn = () => {
        // Store complete URL (path + search) in localStorage before redirecting to login page
        const search = searchParams.toString();
        const redirectUrl = pathname + (search ? `?${search}` : '');
        localStorage.setItem('redirectAfterLogin', redirectUrl);
        window.location.href = '/login'; // Redirect to login page
    };

    return (
        <button className="sign-in" onClick={handleSignIn}>Sign In</button>
    );
};

export default SignIn;
