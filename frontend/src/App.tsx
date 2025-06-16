import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LeadForm from './components/LeadForm';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/chci-nabidku" replace />} />
          <Route path="/chci-nabidku" element={<LeadForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
