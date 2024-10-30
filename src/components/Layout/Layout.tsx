import React from 'react';
import { Outlet } from 'react-router-dom';
import HomeButton from '../HomeButton/HomeButton';
import AuthButtons from '../Authentication/AuthButtons';
import './Layout.css';

const Layout: React.FC = () => {
    return (
        <div>
            <header className="layout-header">
                <HomeButton />
                <AuthButtons />
            </header>
            <main className="layout-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;