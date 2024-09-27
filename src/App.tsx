import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EventRegisterForm from './components/EventRegisterForm/EventRegisterForm';
import EventView from './components/EventView/EventView';

type AppProps = {};


function App({}: AppProps): JSX.Element {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<EventRegisterForm />} />
      <Route path="/event" element={<EventView />} />
      <Route path="/event/admin" element={<EventView />} />
      </Routes>
    </Router>
  );
}


export default App;
