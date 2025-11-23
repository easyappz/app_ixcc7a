import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/register');
  }, [navigate]);

  return (
    <div data-easytag="id1-src/components/Home/index.jsx">
      <div>Перенаправление...</div>
    </div>
  );
};
