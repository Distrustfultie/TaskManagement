// src/pages/SignupPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from './../../components/auth/AuthForm';
import { toast } from 'react-hot-toast';

export default function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignup = async (credentials) => {
    try {
      setLoading(true);
      const response = await fetch('https://taskmanagement-n1tx.onrender.com/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) throw new Error('Registration failed');
      const { token } = await response.json();
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark/5">
      <div className="w-full max-w-md">
        <AuthForm type="signup" onSubmit={handleSignup} loading={loading} />
        <p className="mt-4 text-center text-accent">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}