import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import FeedbackForm from './components/FeedbackForm';

function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('token'));

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<FeedbackForm />} />
        <Route path="/login" element={<Login onLogin={() => setIsAuth(true)} />} />
        <Route path="/admin" element={isAuth ? <AdminPanel /> : <Navigate to="/login" />} />
      </Routes>
    </HashRouter>
  );
}

export default App;  // ← ЭТА СТРОКА ОБЯЗАТЕЛЬНА