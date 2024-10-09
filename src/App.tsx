// App.tsx
import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EventRegisterForm from './components/EventRegisterForm/EventRegisterForm';
import EventView from './components/EventView/EventView';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ClassesProvider } from './context/ClassesContext';
import { SpecializationsProvider } from './context/SpecializationsContext';

const App: React.FC = () => {
    return (
        <div className="App">
            <ClassesProvider>
                <SpecializationsProvider>
                    {/* Place DndProvider here to wrap all components that will use drag and drop */}
                    <DndProvider backend={HTML5Backend}>
                        <Router>
                            <Routes>
                                <Route path="/" element={<EventRegisterForm />} />
                                <Route path="/event" element={<EventView />} />
                                <Route path="/event/admin" element={<EventView />} />
                            </Routes>
                        </Router>
                    </DndProvider>
                </SpecializationsProvider>
            </ClassesProvider>
        </div>
    );
};

export default App;
