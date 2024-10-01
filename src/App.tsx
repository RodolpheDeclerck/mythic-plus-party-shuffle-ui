// App.tsx
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EventRegisterForm from './components/EventRegisterForm/EventRegisterForm';
import EventView from './components/EventView/EventView';
import { ClassesProvider } from './context/ClassesContext'; // Importer le ClassesProvider
import { SpecializationsProvider } from './context/SpecializationsContext'; // Importer le SpecializationsProvider

type AppProps = {};

function App({}: AppProps): JSX.Element {
  return (
    <ClassesProvider> {/* Envelopper avec ClassesProvider */}
      <SpecializationsProvider> {/* Envelopper avec SpecializationsProvider */}
        <Router>
          <Routes>
            <Route path="/" element={<EventRegisterForm />} />
            <Route path="/event" element={<EventView />} />
            <Route path="/event/admin" element={<EventView />} />
          </Routes>
        </Router>
      </SpecializationsProvider>
    </ClassesProvider>
  );
}

export default App;
