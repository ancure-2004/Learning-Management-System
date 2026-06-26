/**
 * Programs.jsx
 * Redirects to Departments page with Programs tab active.
 * (Programs are now managed inside Departments via tabs)
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Programs = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/departments', { state: { tab: 'programs' }, replace: true });
  }, [navigate]);
  return null;
};

export default Programs;
