// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../../components/auth/AuthForm';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) throw new Error('Login failed');
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
        <AuthForm type="login" onSubmit={handleLogin} loading={loading} />
        <p className="mt-4 text-center text-accent">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
        <p className="mt-4 text-center text-accent">
          <Link to="/forgot-password" className="text-primary hover:underline">
            Forgot Password
          </Link>
        </p>
      </div>
    </div>
  );
}