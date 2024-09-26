import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CharacterForm from './components/CharacterCreationForm';
import CharacterList from './components/CharacterAndPartyView';

type AppProps = {};


function App({}: AppProps): JSX.Element {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<CharacterForm />} />
      <Route path="/list" element={<CharacterList />} />
      </Routes>
    </Router>
  );
}


export default App;
