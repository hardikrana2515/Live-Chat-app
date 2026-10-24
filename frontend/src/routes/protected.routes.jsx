import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = (props) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const { Component } = props;
  return (
    <div>
      <Component />
    </div>
  );
};

export default ProtectedRoute;