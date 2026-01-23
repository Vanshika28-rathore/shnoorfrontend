import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingView from './view';

const Landing = () => {
  const navigate = useNavigate();

  const handleLogin = () => navigate('/login');
  const handleRegister = () => navigate('/register');

  return (
    <LandingView 
      onLogin={handleLogin}
      onRegister={handleRegister}
    />
  );
};

export default Landing;