'use client';

import React from 'react';
import HomeButton from '../HomeButton/HomeButton';
import AuthButtons from '../Authentication/AuthButtons';
import './Layout.css';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div>
            <header className="layout-header">
                <HomeButton />
                <AuthButtons />
            </header>
            <main className="layout-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;