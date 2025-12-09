import React, { useState } from 'react';
import { type AdminUser } from '../types';
import Card from './Card';
import { KeyIcon } from './icons/Icons';
import { signIn } from '../src/auth';

interface LoginPageProps {
  onLoginSuccess: (user: AdminUser) => void;
  onBackToHome: () => void;
  adminUsers: AdminUser[];
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBackToHome, adminUsers }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn(email, password);

      if (result.success && result.user) {
        // Map the backend user to AdminUser type
        const adminUser: AdminUser = {
          id: result.user.id,
          name: result.user.name || 'Admin',
          email: result.user.email,
          role: {
            id: 'role-super-admin',
            name: 'Super Admin',
            permissions: []
          },
          passwordHash: ''
        };
        onLoginSuccess(adminUser);
      } else {
        setError(result.error || 'Invalid email or password.');
      }
    } catch (err) {
      setError('An error occurred during login.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-accent min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 onClick={onBackToHome} className="text-4xl font-bold text-primary leading-tight cursor-pointer">
            RoAd<br />RoBo’s
          </h1>
          <p className="text-gray-600 mt-1">Admin Portal</p>
        </div>
        <Card className="p-0">
          <form onSubmit={handleLogin} noValidate>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-center text-primary mb-6">Administrator Login</h2>
              {error && (
                <div className="bg-error/10 border border-error/20 text-error text-sm rounded-lg p-3 mb-4 text-center">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-body mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 bg-white border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text-body mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 bg-white border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 rounded-b-card">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? 'Signing In...' : <> <KeyIcon className="w-5 h-5" /> Sign In </>}
              </button>
            </div>
          </form>
        </Card>
        <p className="text-center text-xs text-gray-500 mt-4">
          For authorized personnel only. <a href="#" onClick={(e) => { e.preventDefault(); onBackToHome(); }} className="text-primary hover:underline">Return to site</a>.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;