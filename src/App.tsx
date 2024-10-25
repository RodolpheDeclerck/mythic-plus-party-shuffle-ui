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
import LoginForm from './components/LoginForm/LoginForm';
import RegisterForm from './components/RegisterForm/RegisterForm';
import Dashboard from './components/Dashboard/Dashboard';
import JoinEventForm from './components/JoinEventForm/JoinEventForm';
import CreateEventPage from './components/CreateEventPage';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
    return (
        <div className="App">
            <AuthProvider>
                <ClassesProvider>
                    <SpecializationsProvider>
                        {/* Place DndProvider here to wrap all components that will use drag and drop */}
                        <DndProvider backend={HTML5Backend}>
                            <Router>
                                <Routes>
                                    <Route path="/" element={<Layout />}>  {/* Utilise le layout pour toutes les routes */}
                                        <Route path="/" element={<JoinEventForm />} />
                                        <Route path="/login" element={<LoginForm />} />
                                        <Route path="/event/register" element={<EventRegisterForm />} />
                                        <Route path="/register" element={<RegisterForm />} />
                                        <Route path="/event" element={<EventView />} />
                                        <Route path="/dashboard" element={<Dashboard />} />
                                        <Route path="/event/join" element={<JoinEventForm />} />
                                        <Route path="/event/create" element={<CreateEventPage />} />
                                    </Route>
                                </Routes>
                            </Router>
                        </DndProvider>
                    </SpecializationsProvider>
                </ClassesProvider>
            </AuthProvider>
        </div>
    );
};

export default App;
