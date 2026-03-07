import React, { useState } from 'react';
import { type AdminUser } from '../types';
import Card from './Card';
import { KeyIcon } from './icons/Icons';
import { signIn } from '../src/auth';

interface ManagerLoginPageProps {
    onLoginSuccess: (user: AdminUser) => void;
    onBackToHome: () => void;
}

const ManagerLoginPage: React.FC<ManagerLoginPageProps> = ({ onLoginSuccess, onBackToHome }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<'Manager' | 'Service Manager'>('Manager');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // --- Demo Bypass for Testing ---
        if (selectedRole === 'Manager' && email === 'manager@roadrobos.com' && password === 'manager123') {
            const demoUser: AdminUser = {
                id: 'demo-manager-id',
                name: 'General Manager',
                email: 'manager@roadrobos.com',
                role: {
                    id: 'role-manager',
                    name: 'Manager',
                    permissions: []
                },
                passwordHash: ''
            };
            setTimeout(() => {
                onLoginSuccess(demoUser);
                setIsLoading(false);
            }, 800);
            return;
        }

        if (selectedRole === 'Service Manager' && email === 'service@roadrobos.com' && password === 'service123') {
            const demoUser: AdminUser = {
                id: 'demo-service-manager-id',
                name: 'Service Manager',
                email: 'service@roadrobos.com',
                role: {
                    id: 'role-service-manager',
                    name: 'Service Manager',
                    permissions: []
                },
                passwordHash: ''
            };
            setTimeout(() => {
                onLoginSuccess(demoUser);
                setIsLoading(false);
            }, 800);
            return;
        }

        try {
            const result = await signIn(email, password);

            if (result.success && result.user) {
                // Map the backend user to AdminUser type
                const adminUser: AdminUser = {
                    id: result.user.id,
                    name: result.user.user_metadata?.name || (selectedRole === 'Manager' ? 'General Manager' : 'Service Manager'),
                    email: result.user.email || '',
                    role: {
                        id: selectedRole === 'Manager' ? 'role-manager' : 'role-service-manager',
                        name: selectedRole,
                        permissions: []
                    },
                    passwordHash: ''
                };
                onLoginSuccess(adminUser);
            } else {
                setError(result.error || 'Invalid manager credentials.');
            }
        } catch (err) {
            setError('An error occurred during login.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-accent min-h-screen flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <h1 onClick={onBackToHome} className="text-4xl font-bold text-primary leading-tight cursor-pointer">
                        RoAd<br />RoBo’s
                    </h1>
                    <p className="text-gray-600 mt-1 font-medium">Manager Portal</p>
                </div>
                <Card className="p-0 shadow-xl border border-gray-100 overflow-hidden">
                    <form onSubmit={handleLogin} noValidate>
                        <div className="p-10">
                            <h2 className={`text-2xl font-bold text-center mb-6 transition-colors duration-300 ${selectedRole === 'Manager' ? 'text-primary' : 'text-amber-600'}`}>
                                {selectedRole === 'Manager' ? 'Manager Login' : 'Service Portal Login'}
                            </h2>

                            {/* Role Toggle */}
                            <div className="flex p-1 bg-gray-100 rounded-lg mb-8 relative">
                                {/* Active background indicator */}
                                <div
                                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-md shadow-sm transition-transform duration-300 ease-in-out ${selectedRole === 'Manager' ? 'translate-x-0' : 'translate-x-full ml-2'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('Manager')}
                                    className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors duration-300 ${selectedRole === 'Manager' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    General Manager
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('Service Manager')}
                                    className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors duration-300 ${selectedRole === 'Service Manager' ? 'text-amber-600' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Service Manager
                                </button>
                            </div>

                            {error && (
                                <div className="bg-error/10 border border-error/20 text-error text-sm rounded-lg p-3 mb-6 text-center animate-shake">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-text-body mb-2 ml-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full p-4 bg-white border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus transition-all shadow-sm"
                                        placeholder={selectedRole === 'Manager' ? 'manager@roadrobos.com' : 'service@roadrobos.com'}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-semibold text-text-body mb-2 ml-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-4 bg-white border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus transition-all shadow-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-gray-50 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full text-white font-bold py-4 rounded-xl hover:bg-opacity-95 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] disabled:opacity-50 ${selectedRole === 'Manager'
                                    ? 'bg-primary hover:shadow-primary/20'
                                    : 'bg-amber-600 hover:shadow-amber-600/20'
                                    }`}
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <KeyIcon className="w-5 h-5" />
                                        <span>Sign In</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </Card>
                <p className="text-center text-xs text-gray-500 mt-6 font-medium">
                    For authorized personnel only. <button onClick={onBackToHome} className="text-primary hover:underline transition-all">Return to site.</button>
                </p>
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.2s ease-in-out 0s 2;
                }
            `}</style>
        </div>
    );
};

export default ManagerLoginPage;
