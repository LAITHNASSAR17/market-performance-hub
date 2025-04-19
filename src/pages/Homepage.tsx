
import React from 'react';
import { Navigate } from 'react-router-dom';

const Homepage = () => {
  return <Navigate to="/dashboard" replace />;
};

export default Homepage;
