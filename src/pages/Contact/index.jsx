import React from 'react';
import { useNavigate } from 'react-router-dom';
import ContactView from './view';

const Contact = () => {
  const navigate = useNavigate();

  const handleBack = () => navigate('/');

  return (
    <ContactView onBack={handleBack} />
  );
};

export default Contact;