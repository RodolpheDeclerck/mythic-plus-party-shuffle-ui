'use client';

// AuthButtons.tsx
import React, { useEffect, useState } from 'react';
import SignIn from './SignIn';
import SignUp from './SignUp';
import Logout from './Logout';
import DashBoardButton from './DashBoardButton';
import Cookies from 'js-cookie';  // Import js-cookie
import useAuthCheck from '../../hooks/useAuthCheck';
import './AuthButton.css';


const AuthButtons = () => {
    const { isAuthenticated, isAuthChecked, handleLogout } = useAuthCheck();

    return (
        <div>
            <div className="auth-buttons">
                {isAuthenticated ? (
                    <>
                        <DashBoardButton />
                        <Logout />
                    </>
                ) : (
                    <>
                        <SignIn />
                        <SignUp />
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthButtons;
