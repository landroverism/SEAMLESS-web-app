import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Measurements from '../pages/Measurements';
import Tailors from '../pages/Tailors';
import Login from '../pages/Login';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/measurements" element={<Measurements />} />
      <Route path="/tailors" element={<Tailors />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;