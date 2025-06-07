
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthForm from './AuthForm';
import { AlertMessage, AlertType } from '../../types'; // Assuming AlertMessage types are defined

const SignupPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [successMessage, setSuccessMessage] = useState<string | null>(null); // For success feedback
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    // setSuccessMessage(null);
    try {
      await signup(email, password);
      // setSuccessMessage("Signup successful! Please login to continue.");
      // For Phase 1, redirect to login after successful signup
      // Consider adding a success message display mechanism if UX requires it.
      alert("Signup successful! Please login."); // Simple alert for now
      navigate('/login');
    } catch (err) {
      setError((err as Error).message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Example of how you might display success message if needed:
  // {successMessage && <p className="text-sm text-green-400 bg-green-900/30 p-3 rounded-md text-center">{successMessage}</p>}
  return <AuthForm mode="signup" onSubmit={handleSignup} loading={loading} serverError={error} />;
};

export default SignupPage;
    