// Logout.tsx
import React from 'react';
import useAuthCheck from '../../hooks/useAuthCheck';

const Logout = () => {
    const { isAuthenticated, isAuthChecked, handleLogout } = useAuthCheck();

    return (
        <button className="logout" onClick={handleLogout}>Logout</button>
    );
};

export default Logout;
