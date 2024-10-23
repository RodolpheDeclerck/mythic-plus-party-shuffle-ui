// Layout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import HomeButton from './HomeButton/HomeButton';
import AuthButtons from './Authentication/AuthButtons';

const Layout: React.FC = () => {
    return (
        <div>
            <HomeButton />  {/* Le bouton Home est ajouté ici */}
            <AuthButtons />  {/* Les boutons d'authentification sont ajoutés ici */}
            <Outlet />  {/* Cela représente le contenu de chaque page */}
        </div>
    );
};

export default Layout;
