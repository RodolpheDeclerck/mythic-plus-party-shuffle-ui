'use client';

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AuthProvider } from './context/AuthContext';
import { ClassesProvider } from './context/ClassesContext';
import { SpecializationsProvider } from './context/SpecializationsContext';
import './i18n';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ClassesProvider>
        <SpecializationsProvider>
          <DndProvider backend={HTML5Backend}>
            {children}
          </DndProvider>
        </SpecializationsProvider>
      </ClassesProvider>
    </AuthProvider>
  );
}
