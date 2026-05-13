import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';  // ← Проверьте, что файл существует
import FeedbackForm from './components/FeedbackForm';

const App: React.FC = () => {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('token'));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FeedbackForm />} />
        <Route path="/login" element={<Login onLogin={() => setIsAuth(true)} />} />
        <Route path="/admin" element={isAuth ? <AdminPanel /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;