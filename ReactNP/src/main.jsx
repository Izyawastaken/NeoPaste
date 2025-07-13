import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import CreatePaste from './pages/CreatePaste';
import ViewPaste from './pages/ViewPaste';
import './main.css';
import './view.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<CreatePaste />} />
        <Route path="/view/:id" element={<ViewPaste />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
